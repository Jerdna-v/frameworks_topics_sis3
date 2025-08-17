import React from "react";

export default function AboutAppView() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About This Application</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
        <p>
          This web application is designed to manage coffee vending machines, their
          inventory, notifications, users, and geographic locations. It supports
          three types of users: <strong>Owner</strong>, <strong>Manager</strong>, and
          <strong> Worker</strong>. Real-time functionality is enabled via Socket.IO.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Main Features</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Machine View:</strong> View and manage machine data.</li>
          <li><strong>Upload View:</strong> Upload performance or technical logs.</li>
          <li><strong>Inventory View:</strong> Add products with type and weight per machine.</li>
          <li><strong>Cash Flow:</strong> Input cash collections per machine with date/amount.</li>
          <li><strong>Notifications:</strong> Owners send notifications to workers; workers can mark them as done.</li>
          <li><strong>Map View:</strong> View machine and worker locations. Click on map to add machines.</li>
          <li><strong>Users View:</strong> (Owner-only) Assign users as managers to limit their access.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Roles & Permissions</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Owner:</strong> Full access to all views including user management and notification control.</li>
          <li><strong>Manager:</strong> Cannot manage users but can use all operational views.</li>
          <li><strong>Worker:</strong> Sees only assigned notifications, can upload logs, and view maps.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Real-Time Features</h2>
        <p>
          Notifications are pushed to workers instantly upon sending. Once a worker marks a
          task done, the owner is notified in real time.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Adding Machines</h2>
        <p>
          Click on the map to add a new machine. Fill out machine details like ID, name,
          type, location, or check "Store" if location isn't applicable. These are saved
          live to the system.
        </p>
      </section>
    </div>
  );
}