import { useState, useEffect } from "react";
import {
  AirtableClient,
  AirtableAppointment,
  AirtableAvailability,
  AirtableService,
} from "@/lib/airtable";

// Custom hook for clients
export function useClients() {
  const [clients, setClients] = useState<AirtableClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<AirtableClient, "id">) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) throw new Error("Failed to create client");
      const newClient = await response.json();
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<AirtableClient>) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update client");
      const updatedClient = await response.json();
      setClients((prev) =>
        prev.map((client) => (client.id === id ? updatedClient : client)),
      );
      return updatedClient;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
  };
}

// Custom hook for appointments
export function useAppointments() {
  const [appointments, setAppointments] = useState<AirtableAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (
    appointmentData: Omit<AirtableAppointment, "id">,
  ) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) throw new Error("Failed to create appointment");
      const newAppointment = await response.json();
      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    createAppointment,
  };
}

// Custom hook for availability
export function useAvailability(date: string) {
  const [availability, setAvailability] = useState<AirtableAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    if (!date) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/availability?date=${date}`);
      if (!response.ok) throw new Error("Failed to fetch availability");
      const data = await response.json();
      setAvailability(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [date]);

  return {
    availability,
    loading,
    error,
    refetch: fetchAvailability,
  };
}

// Custom hook for services
export function useServices() {
  const [services, setServices] = useState<AirtableService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
}
