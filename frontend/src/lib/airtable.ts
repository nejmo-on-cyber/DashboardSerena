import Airtable from "airtable";

// Debug logging
console.log("Environment check:", {
  hasApiKey: !!process.env.AIRTABLE_API_KEY,
  hasBaseId: !!process.env.AIRTABLE_BASE_ID,
  apiKeyLength: process.env.AIRTABLE_API_KEY?.length,
  baseIdLength: process.env.AIRTABLE_BASE_ID?.length,
});

// Initialize Airtable with error handling
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey) {
  console.warn("AIRTABLE_API_KEY not found in environment variables");
}

if (!baseId) {
  console.warn("AIRTABLE_BASE_ID not found in environment variables");
}

// Only initialize if we have the required credentials
let airtable: Airtable | null = null;
let base: any = null;

if (apiKey && baseId) {
  try {
    airtable = new Airtable({ apiKey });
    base = airtable.base(baseId);
    console.log("Airtable initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Airtable:", error);
  }
} else {
  console.error("Missing Airtable credentials:", {
    apiKey: !!apiKey,
    baseId: !!baseId,
  });
}

// Table names - customize these based on your Airtable setup
export const TABLES = {
  CLIENTS: "Table 1", // Use your actual table name
  APPOINTMENTS: "Appointments",
  SERVICES: "Services",
  STAFF: "Staff",
  AVAILABILITY: "Availability",
  PROMOTIONS: "Promotions",
  REVENUE: "Revenue",
};

// Client interface
export interface AirtableClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit?: string;
  nextAppointment?: string;
  preferredService?: string;
  totalVisits: number;
  totalSpent: number;
  tags: string[];
  notes?: string;
  createdAt: string;
}

// Appointment interface
export interface AirtableAppointment {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  price: number;
  notes?: string;
}

// Availability interface
export interface AirtableAvailability {
  id: string;
  staff: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

// Service interface
export interface AirtableService {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  category: string;
}

// Helper function to check if Airtable is configured
const isConfigured = () => {
  const configured = base !== null && apiKey && baseId;
  console.log("isConfigured check:", {
    configured,
    hasBase: !!base,
    hasApiKey: !!apiKey,
    hasBaseId: !!baseId,
  });
  return configured;
};

// Client operations
export const clientOperations = {
  // Get all clients
  async getAll(): Promise<AirtableClient[]> {
    console.log("clientOperations.getAll called");

    if (!isConfigured()) {
      console.error("Airtable not configured - returning mock data");
      // Return mock data instead of throwing error
      return [
        {
          id: "mock1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "+1 (555) 123-4567",
          lastVisit: "2024-01-15",
          preferredService: "Hair Cut & Color",
          totalVisits: 12,
          totalSpent: 1450,
          tags: ["VIP", "Regular"],
          notes: "Prefers Jessica as stylist",
          createdAt: new Date().toISOString(),
        },
        {
          id: "mock2",
          name: "Mike Chen",
          email: "mike@example.com",
          phone: "+1 (555) 987-6543",
          lastVisit: "2024-01-10",
          preferredService: "Beard Trim",
          totalVisits: 8,
          totalSpent: 320,
          tags: ["Regular"],
          notes: "Usually books on weekends",
          createdAt: new Date().toISOString(),
        },
      ];
    }

    try {
      // First, let's see what fields are available
      const records = await base(TABLES.CLIENTS)
        .select({
          maxRecords: 1,
        })
        .all();

      if (records.length > 0) {
        console.log("Available fields:", Object.keys(records[0].fields));
      }

      // Get all records with flexible field mapping
      const allRecords = await base(TABLES.CLIENTS).select().all();

      return allRecords.map((record) => {
        const fields = record.fields;
        console.log("Record fields:", Object.keys(fields));

        return {
          id: record.id,
          name:
            fields["Name"] ||
            fields["Client Name"] ||
            fields["name"] ||
            "Unknown",
          email: fields["Email"] || fields["email"] || "",
          phone: fields["Phone"] || fields["phone"] || "",
          lastVisit: fields["Last Visit"] || fields["lastVisit"] || "",
          nextAppointment:
            fields["Next Appointment"] || fields["nextAppointment"] || "",
          preferredService:
            fields["Preferred Service"] || fields["preferredService"] || "",
          totalVisits: fields["Total Visits"] || fields["totalVisits"] || 0,
          totalSpent: fields["Total Spent"] || fields["totalSpent"] || 0,
          tags: fields["Tags"] || fields["tags"] || [],
          notes: fields["Notes"] || fields["notes"] || "",
          createdAt:
            fields["Created At"] ||
            fields["createdAt"] ||
            new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Return mock data on error
      return [
        {
          id: "mock1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "+1 (555) 123-4567",
          lastVisit: "2024-01-15",
          preferredService: "Hair Cut & Color",
          totalVisits: 12,
          totalSpent: 1450,
          tags: ["VIP", "Regular"],
          notes: "Prefers Jessica as stylist",
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  // Create new client
  async create(client: Omit<AirtableClient, "id">): Promise<AirtableClient> {
    if (!isConfigured()) {
      console.error("Airtable not configured - cannot create client");
      throw new Error(
        "Airtable not configured. Please check your API key and Base ID.",
      );
    }

    try {
      const record = await base(TABLES.CLIENTS).create({
        Name: client.name,
        Email: client.email,
        Phone: client.phone,
        "Preferred Service": client.preferredService,
        "Total Visits": client.totalVisits,
        "Total Spent": client.totalSpent,
        Tags: client.tags,
        Notes: client.notes,
      });

      return {
        id: record.id,
        ...client,
        createdAt: record.get("Created At") as string,
      };
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },

  // Update client
  async update(
    id: string,
    updates: Partial<AirtableClient>,
  ): Promise<AirtableClient> {
    if (!isConfigured()) {
      throw new Error(
        "Airtable not configured. Please check your API key and Base ID.",
      );
    }

    try {
      const record = await base(TABLES.CLIENTS).update(id, {
        ...(updates.name && { Name: updates.name }),
        ...(updates.email && { Email: updates.email }),
        ...(updates.phone && { Phone: updates.phone }),
        ...(updates.lastVisit && { "Last Visit": updates.lastVisit }),
        ...(updates.nextAppointment && {
          "Next Appointment": updates.nextAppointment,
        }),
        ...(updates.preferredService && {
          "Preferred Service": updates.preferredService,
        }),
        ...(updates.totalVisits !== undefined && {
          "Total Visits": updates.totalVisits,
        }),
        ...(updates.totalSpent !== undefined && {
          "Total Spent": updates.totalSpent,
        }),
        ...(updates.tags && { Tags: updates.tags }),
        ...(updates.notes && { Notes: updates.notes }),
      });

      return {
        id: record.id,
        name: record.get("Name") as string,
        email: record.get("Email") as string,
        phone: record.get("Phone") as string,
        lastVisit: record.get("Last Visit") as string,
        nextAppointment: record.get("Next Appointment") as string,
        preferredService: record.get("Preferred Service") as string,
        totalVisits: record.get("Total Visits") as number,
        totalSpent: record.get("Total Spent") as number,
        tags: record.get("Tags") as string[],
        notes: record.get("Notes") as string,
        createdAt: record.get("Created At") as string,
      };
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  },
};

// Appointment operations
export const appointmentOperations = {
  // Get all appointments
  async getAll(): Promise<AirtableAppointment[]> {
    if (!isConfigured()) {
      return []; // Return empty array for mock data
    }

    try {
      const records = await base(TABLES.APPOINTMENTS)
        .select({
          sort: [{ field: "Date", direction: "desc" }],
        })
        .all();

      return records.map((record) => ({
        id: record.id,
        clientId: record.get("Client ID") as string,
        clientName: record.get("Client Name") as string,
        service: record.get("Service") as string,
        staff: record.get("Staff") as string,
        date: record.get("Date") as string,
        time: record.get("Time") as string,
        duration: record.get("Duration") as number,
        status: record.get("Status") as
          | "scheduled"
          | "completed"
          | "cancelled"
          | "no-show",
        price: record.get("Price") as number,
        notes: record.get("Notes") as string,
      }));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  },

  // Create new appointment
  async create(
    appointment: Omit<AirtableAppointment, "id">,
  ): Promise<AirtableAppointment> {
    if (!isConfigured()) {
      throw new Error(
        "Airtable not configured. Please check your API key and Base ID.",
      );
    }

    try {
      const record = await base(TABLES.APPOINTMENTS).create({
        "Client ID": appointment.clientId,
        "Client Name": appointment.clientName,
        Service: appointment.service,
        Staff: appointment.staff,
        Date: appointment.date,
        Time: appointment.time,
        Duration: appointment.duration,
        Status: appointment.status,
        Price: appointment.price,
        Notes: appointment.notes,
      });

      return {
        id: record.id,
        ...appointment,
      };
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },
};

// Availability operations
export const availabilityOperations = {
  // Get availability for a specific date
  async getByDate(date: string): Promise<AirtableAvailability[]> {
    if (!isConfigured()) {
      return []; // Return empty array for mock data
    }

    try {
      const records = await base(TABLES.AVAILABILITY)
        .select({
          filterByFormula: `{Date} = '${date}'`,
          sort: [{ field: "Start Time", direction: "asc" }],
        })
        .all();

      return records.map((record) => ({
        id: record.id,
        staff: record.get("Staff") as string,
        date: record.get("Date") as string,
        startTime: record.get("Start Time") as string,
        endTime: record.get("End Time") as string,
        isAvailable: record.get("Is Available") as boolean,
        appointmentId: record.get("Appointment ID") as string,
      }));
    } catch (error) {
      console.error("Error fetching availability:", error);
      return [];
    }
  },

  // Update availability slot
  async update(
    id: string,
    updates: Partial<AirtableAvailability>,
  ): Promise<AirtableAvailability> {
    if (!isConfigured()) {
      throw new Error(
        "Airtable not configured. Please check your API key and Base ID.",
      );
    }

    try {
      const record = await base(TABLES.AVAILABILITY).update(id, {
        ...(updates.staff && { Staff: updates.staff }),
        ...(updates.isAvailable !== undefined && {
          "Is Available": updates.isAvailable,
        }),
        ...(updates.appointmentId && {
          "Appointment ID": updates.appointmentId,
        }),
      });

      return {
        id: record.id,
        staff: record.get("Staff") as string,
        date: record.get("Date") as string,
        startTime: record.get("Start Time") as string,
        endTime: record.get("End Time") as string,
        isAvailable: record.get("Is Available") as boolean,
        appointmentId: record.get("Appointment ID") as string,
      };
    } catch (error) {
      console.error("Error updating availability:", error);
      throw error;
    }
  },
};

// Service operations
export const serviceOperations = {
  // Get all services
  async getAll(): Promise<AirtableService[]> {
    if (!isConfigured()) {
      return []; // Return empty array for mock data
    }

    try {
      const records = await base(TABLES.SERVICES)
        .select({
          sort: [{ field: "Name", direction: "asc" }],
        })
        .all();

      return records.map((record) => ({
        id: record.id,
        name: record.get("Name") as string,
        duration: record.get("Duration") as number,
        price: record.get("Price") as number,
        description: record.get("Description") as string,
        category: record.get("Category") as string,
      }));
    } catch (error) {
      console.error("Error fetching services:", error);
      return [];
    }
  },
};

export { isConfigured };
export default base;
