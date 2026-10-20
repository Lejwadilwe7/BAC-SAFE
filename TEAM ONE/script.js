
/*
=========================================================
 BAC SAFE - CAMPUS SAFETY SYSTEM
 Frontend demonstration using HTML, CSS and JavaScript
=========================================================

IMPORTANT:
- Demo accounts and data are stored in localStorage.
- Do not use this demo storage for real student passwords.
- Alerts and password resets are simulated.
- Real notifications require a secure backend.
*/

"use strict";

// =======================================================
// 1. GENERAL HELPERS
// =======================================================

const STORAGE = {
    students: "bacSafeStudents",
    currentUser: "bacSafeCurrentUser",
    alerts: "bacSafeAlerts",
    resetRequests: "bacSafeResetRequests"
};

function getData(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error("Could not read stored data:", error);
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function showMessage(message, type = "info") {
    let box = document.getElementById("message");

    if (!box) {
        box = document.createElement("div");
        box.id = "message";
        box.setAttribute("role", "status");
        box.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            max-width: 340px;
            padding: 16px 20px;
            border-radius: 10px;
            color: white;
            font: 15px Arial, sans-serif;
            box-shadow: 0 4px 15px #0003;
        `;
        document.body.appendChild(box);
    }

    const colors = {
        success: "#15803d",
        error: "#b91c1c",
        info: "#1d4ed8",
        warning: "#b45309"
    };

    box.textContent = message;
    box.style.backgroundColor = colors[type] || colors.info;
    box.style.display = "block";

    clearTimeout(showMessage.timeout);
    showMessage.timeout = setTimeout(() => {
        box.style.display = "none";
    }, 5000);
}

function getCurrentUser() {
    return getData(STORAGE.currentUser, null);
}

function setCurrentUser(student) {
    saveData(STORAGE.currentUser, student);
}

function getStudentById(studentId) {
    return getData(STORAGE.students, []).find(
        student => student.studentId.toLowerCase() ===
            studentId.trim().toLowerCase()
    );
}

function makeId() {
    return "INC-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 7).toUpperCase();
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

// =======================================================
// 2. REGISTER A STUDENT
// =======================================================

function registerStudent(event) {
    event.preventDefault();

    const studentId =
        document.getElementById("studentId")?.value.trim();
    const fullName =
        document.getElementById("fullName")?.value.trim();
    const age =
        Number(document.getElementById("age")?.value);
    const email =
        document.getElementById("email")?.value.trim();
    const phone =
        document.getElementById("phone")?.value.trim();
    const password =
        document.getElementById("password")?.value;
    const confirmPassword =
        document.getElementById("confirmPassword")?.value;

    const emergencyName =
        document.getElementById("emergencyName")?.value.trim();
    const emergencyPhone =
        document.getElementById("emergencyPhone")?.value.trim();
    const emergencyRelationship =
        document.getElementById("emergencyRelationship")?.value.trim();

    if (
        !studentId || !fullName || !email || !phone ||
        !password || !confirmPassword ||
        !emergencyName || !emergencyPhone
    ) {
        return showMessage(
            "Please complete all required fields.",
            "error"
        );
    }

    if (!Number.isFinite(age) || age < 16 || age > 100) {
        return showMessage("Please enter a valid age.", "error");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showMessage("Enter a valid email address.", "error");
    }

    if (password.length < 8) {
        return showMessage(
            "Your password must contain at least 8 characters.",
            "error"
        );
    }

    if (password !== confirmPassword) {
        return showMessage("Your passwords do not match.", "error");
    }

    const students = getData(STORAGE.students, []);

    if (students.some(s =>
        s.studentId.toLowerCase() === studentId.toLowerCase()
    )) {
        return showMessage(
            "This student ID is already registered.",
            "error"
        );
    }

    if (students.some(s =>
        s.email.toLowerCase() === email.toLowerCase()
    )) {
        return showMessage(
            "This email address is already registered.",
            "error"
        );
    }

    /*
    DEMO ONLY:
    Passwords are stored as plain text in this prototype.
    A production backend must hash passwords securely.
    */

    const student = {
        studentId,
        fullName,
        age,
        email,
        phone,
        password,
        emergencyContacts: [
            {
                name: emergencyName,
                phone: emergencyPhone,
                relationship: emergencyRelationship || "Not specified"
            }
        ],
        registeredAt: new Date().toISOString()
    };

    students.push(student);
    saveData(STORAGE.students, students);

    showMessage(
        "Registration successful! You can now log in.",
        "success"
    );

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
}

// =======================================================
// 3. LOGIN
// =======================================================

function loginStudent(event) {
    event.preventDefault();

    const studentId =
        document.getElementById("studentId")?.value.trim();
    const password =
        document.getElementById("password")?.value;

    if (!studentId || !password) {
        return showMessage(
            "Enter your student ID and password.",
            "error"
        );
    }

    const student = getStudentById(studentId);

    if (!student || student.password !== password) {
        return showMessage(
            "Incorrect student ID or password. Try again or reset your password.",
            "error"
        );
    }

    // Never put the password into the logged-in session object.
    const session = {
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        emergencyContacts: student.emergencyContacts
    };

    setCurrentUser(session);

    showMessage("Login successful. Welcome to BAC SAFE!", "success");

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);
}

// =======================================================
// 4. SHOW / HIDE PASSWORD
// =======================================================

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);

    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    if (button) {
        button.textContent = isPassword ? "Hide" : "Show";
        button.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    }
}

// =======================================================
// 5. DEMO PASSWORD RESET
// =======================================================

function requestPasswordReset(event) {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();

    if (!email) {
        return showMessage(
            "Enter your registered email address.",
            "error"
        );
    }

    const student = getData(STORAGE.students, []).find(
        s => s.email.toLowerCase() === email.toLowerCase()
    );

    /*
    In production, always return a generic response.
    Send a single-use, expiring reset link from the backend.
    Never reveal whether an account exists.
    */

    const requests = getData(STORAGE.resetRequests, []);

    if (student) {
        // This only records a simulated request. No email is sent.
        requests.push({
            studentId: student.studentId,
            requestedAt: new Date().toISOString(),
            demoOnly: true
        });

        saveData(STORAGE.resetRequests, requests);
    }

    showMessage(
        "If an account exists, password reset instructions would be sent to its registered email. Demo mode does not send emails.",
        "info"
    );
}

// DEMO ONLY: This function is NOT secure for real password resets.
// Do not expose it as a production password-reset mechanism.
function demoResetPassword(event) {
    event.preventDefault();

    const studentId =
        document.getElementById("studentId")?.value.trim();
    const newPassword =
        document.getElementById("newPassword")?.value;
    const confirmPassword =
        document.getElementById("confirmPassword")?.value;

    if (!studentId || !newPassword || !confirmPassword) {
        return showMessage("Complete all fields.", "error");
    }

    if (newPassword.length < 8) {
        return showMessage(
            "Password must contain at least 8 characters.",
            "error"
        );
    }

    if (newPassword !== confirmPassword) {
        return showMessage("Passwords do not match.", "error");
    }

    const students = getData(STORAGE.students, []);
    const index = students.findIndex(
        s => s.studentId.toLowerCase() === studentId.toLowerCase()
    );

    if (index === -1) {
        return showMessage(
            "Student account not found in demo data.",
            "error"
        );
    }

    students[index].password = newPassword;
    saveData(STORAGE.students, students);

    showMessage(
        "Demo password changed. Return to the login page.",
        "success"
    );

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
}

// =======================================================
// 6. DASHBOARD
// =======================================================

function loadDashboard() {
    const student = getCurrentUser();

    if (!student) {
        window.location.href = "login.html";
        return;
    }

    const nameElement = document.getElementById("studentName");
    if (nameElement) {
        nameElement.textContent = student.fullName;
    }

    const idElement = document.getElementById("studentIdDisplay");
    if (idElement) {
        idElement.textContent = student.studentId;
    }

    const contactsElement = document.getElementById("contactSummary");

    if (contactsElement) {
        contactsElement.replaceChildren();

        (student.emergencyContacts || []).forEach(contact => {
            const item = document.createElement("p");
            item.textContent =
                `${contact.name} (${contact.relationship}): ${contact.phone}`;
            contactsElement.appendChild(item);
        });
    }

    loadRecentAlerts();
}

// =======================================================
// 7. NOT SAFE / SOS EMERGENCY ALERT
// =======================================================

let emergencyInProgress = false;

function triggerEmergency() {
    if (emergencyInProgress) {
        return showMessage(
            "An emergency incident is already being processed.",
            "warning"
        );
    }

    const student = getCurrentUser();

    if (!student) {
        showMessage("Please log in first.", "error");
        window.location.href = "login.html";
        return;
    }

    const confirmed = window.confirm(
        "Are you feeling unsafe? Start an emergency alert?\n\n" +
        "In this demo, alerts are simulated and no real responders are contacted."
    );

    if (!confirmed) return;

    emergencyInProgress = true;

    const incident = {
        id: makeId(),
        studentId: student.studentId,
        studentName: student.fullName,
        studentPhone: student.phone,
        createdAt: new Date().toISOString(),
        status: "ACTIVE",
        latitude: null,
        longitude: null,
        accuracy: null,
        locationStatus: "Pending",
        securityStatus: "SIMULATED - NOT SENT",
        contactStatus: "SIMULATED - NOT SENT",
        history: [
            {
                time: new Date().toISOString(),
                event: "Emergency alert initiated in demo mode."
            }
        ]
    };

    const alerts = getData(STORAGE.alerts, []);
    alerts.unshift(incident);
    saveData(STORAGE.alerts, alerts);

    showMessage(
        "Demo emergency activated. No real alert has been sent. Obtaining location if permitted...",
        "warning"
    );

    updateEmergencyButton(true);

    // Attempt to obtain the student's location.
    if (!navigator.geolocation) {
        updateIncidentLocation(
            incident.id,
            null,
            "Geolocation is not supported by this browser."
        );
        finishEmergency(incident.id);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            updateIncidentLocation(incident.id, location, "Location obtained");
            finishEmergency(incident.id);
        },
        error => {
            let reason = "Location unavailable.";

            if (error.code === 1) {
                reason = "Location permission denied.";
            } else if (error.code === 2) {
                reason = "Location position unavailable.";
            } else if (error.code === 3) {
                reason = "Location request timed out.";
            }

            updateIncidentLocation(incident.id, null, reason);
            finishEmergency(incident.id);
        },
        {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0
        }
    );

    // Do not leave the interface permanently locked if location hangs.
    setTimeout(() => {
        if (emergencyInProgress) {
            emergencyInProgress = false;
            updateEmergencyButton(false);
            showMessage(
                "Location is taking too long. Check the incident status and seek help directly if needed.",
                "warning"
            );
        }
    }, 15000);
}

function updateIncidentLocation(incidentId, location, status) {
    const alerts = getData(STORAGE.alerts, []);
    const incident = alerts.find(a => a.id === incidentId);

    if (!incident) return;

    incident.locationStatus = status;

    if (location) {
        incident.latitude = location.latitude;
        incident.longitude = location.longitude;
        incident.accuracy = location.accuracy;

        incident.history.push({
            time: new Date().toISOString(),
            event: "Location obtained in this browser demo."
        });
    }

    saveData(STORAGE.alerts, alerts);
}

function finishEmergency(incidentId) {
    emergencyInProgress = false;
    updateEmergencyButton(false);

    const alerts = getData(STORAGE.alerts, []);
    const incident = alerts.find(a => a.id === incidentId);

    if (incident) {
        incident.history.push({
            time: new Date().toISOString(),
            event: "Demo incident recorded. No real notifications sent."
        });

        saveData(STORAGE.alerts, alerts);
    }

    showMessage(
        "Demo incident recorded. Security and contacts have NOT been notified.",
        "warning"
    );

    loadRecentAlerts();

    // Open the status page if it exists in your project.
    const statusLink = document.getElementById("alertStatusLink");

    if (statusLink) {
        statusLink.href =
            "alert-status.html?id=" + encodeURIComponent(incidentId);
    }
}

function updateEmergencyButton(active) {
    const button = document.getElementById("sosButton");

    if (!button) return;

    button.disabled = active;
    button.textContent = active
        ? "PROCESSING DEMO ALERT..."
        : "I AM NOT SAFE - SOS";
}

// =======================================================
// 8. RECENT ALERTS
// =======================================================

function loadRecentAlerts() {
    const container = document.getElementById("recentAlerts");
    if (!container) return;

    container.replaceChildren();

    const student = getCurrentUser();
    if (!student) return;

    const alerts = getData(STORAGE.alerts, []).filter(
        alert => alert.studentId === student.studentId
    );

    if (alerts.length === 0) {
        container.textContent = "No recent incidents.";
        return;
    }

    alerts.slice(0, 5).forEach(alert => {
        const item = document.createElement("div");
        item.className = "alert-card";

        const heading = document.createElement("h3");
        heading.textContent = alert.id;

        const status = document.createElement("p");
        status.textContent = "Status: " + alert.status;

        const time = document.createElement("p");
        time.textContent = "Created: " + formatDate(alert.createdAt);

        const location = document.createElement("p");
        location.textContent = "Location: " + alert.locationStatus;

        const link = document.createElement("a");
        link.href = "alert-status.html?id=" + encodeURIComponent(alert.id);
        link.textContent = "View incident";

        item.append(heading, status, time, location, link);
        container.appendChild(item);
    });
}

// =======================================================
// 9. EMERGENCY CONTACT MANAGEMENT
// =======================================================

function addEmergencyContact(event) {
    event.preventDefault();

    const student = getCurrentUser();

    if (!student) {
        return showMessage("Please log in first.", "error");
    }

    const name = document.getElementById("contactName")?.value.trim();
    const phone = document.getElementById("contactPhone")?.value.trim();
    const relationship =
        document.getElementById("relationship")?.value.trim();

    if (!name || !phone) {
        return showMessage(
            "Enter the contact's name and phone number.",
            "error"
        );
    }

    const students = getData(STORAGE.students, []);
    const index = students.findIndex(
        s => s.studentId === student.studentId
    );

    if (index === -1) {
        return showMessage("Student account not found.", "error");
    }

    students[index].emergencyContacts =
        students[index].emergencyContacts || [];

    if (students[index].emergencyContacts.length >= 5) {
        return showMessage(
            "You can add up to five emergency contacts in this demo.",
            "warning"
        );
    }

    students[index].emergencyContacts.push({
        name,
        phone,
        relationship: relationship || "Not specified"
    });

    saveData(STORAGE.students, students);

    // Refresh session data without including the password.
    setCurrentUser({
        studentId: students[index].studentId,
        fullName: students[index].fullName,
        email: students[index].email,
        phone: students[index].phone,
        emergencyContacts: students[index].emergencyContacts
    });

    event.target.reset();

    showMessage("Emergency contact added.", "success");
    renderEmergencyContacts();
}

function renderEmergencyContacts() {
    const container = document.getElementById("emergencyContactsList");
    const student = getCurrentUser();

    if (!container || !student) return;

    container.replaceChildren();

    (student.emergencyContacts || []).forEach((contact, index) => {
        const row = document.createElement("div");
        row.className = "contact-card";

        const details = document.createElement("p");
        details.textContent =
            `${contact.name} - ${contact.relationship} - ${contact.phone}`;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            removeEmergencyContact(index);
        });

        row.append(details, remove);
        container.appendChild(row);
    });
}

function removeEmergencyContact(index) {
    const student = getCurrentUser();

    if (!student) return;

    if (!window.confirm("Remove this emergency contact?")) return;

    const students = getData(STORAGE.students, []);
    const studentIndex = students.findIndex(
        s => s.studentId === student.studentId
    );

    if (studentIndex === -1) return;

    students[studentIndex].emergencyContacts.splice(index, 1);
    saveData(STORAGE.students, students);

    setCurrentUser({
        studentId: students[studentIndex].studentId,
        fullName: students[studentIndex].fullName,
        email: students[studentIndex].email,
        phone: students[studentIndex].phone,
        emergencyContacts: students[studentIndex].emergencyContacts
    });

    renderEmergencyContacts();
    showMessage("Contact removed.", "success");
}

// =======================================================
// 10. CAMPUS MAP / CURRENT LOCATION
// =======================================================

let studentMap = null;
let studentMarker = null;

function initializeCampusMap() {
    const mapElement = document.getElementById("campusMap");

    if (!mapElement) return;

    if (typeof L === "undefined") {
        showMessage(
            "Map library unavailable. Check your Leaflet script link.",
            "error"
        );
        return;
    }

    /*
    IMPORTANT:
    Replace these approximate starting coordinates with
    verified coordinates for your BAC campus and campus
    buildings before presenting the map as accurate.
    */

    const bacCoordinates = [-24.6282, 25.9231];

    studentMap = L.map("campusMap").setView(bacCoordinates, 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(studentMap);

    L.marker(bacCoordinates)
        .addTo(studentMap)
        .bindPopup("BAC campus - verify this location")
        .openPopup();

    const locationButton =
        document.getElementById("getMyLocation");

    if (locationButton) {
        locationButton.addEventListener("click", showMyLocation);
    }
}

function showMyLocation() {
    if (!studentMap) {
        return showMessage("The map is not ready.", "error");
    }

    if (!navigator.geolocation) {
        return showMessage(
            "Your browser does not support location services.",
            "error"
        );
    }

    showMessage("Requesting your location permission...", "info");

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            if (studentMarker) {
                studentMap.removeLayer(studentMarker);
            }

            studentMarker = L.marker([lat, lng])
                .addTo(studentMap)
                .bindPopup(
                    "Your current location (accuracy approximately " +
                    Math.round(accuracy) + " metres)"
                )
                .openPopup();

            studentMap.setView([lat, lng], 18);

            showMessage("Your location is displayed on the map.", "success");
        },
        error => {
            const message = error.code === 1
                ? "Location permission denied."
                : "Unable to obtain your location.";

            showMessage(message, "error");
        },
        {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0
        }
    );
}

// =======================================================
// 11. INCIDENT STATUS PAGE
// =======================================================

function loadIncidentStatus() {
    const container = document.getElementById("incidentDetails");
    if (!container) return;

    const student = getCurrentUser();

    if (!student) {
        window.location.href = "login.html";
        return;
    }

    const incidentId =
        new URLSearchParams(window.location.search).get("id");

    const incident = getData(STORAGE.alerts, []).find(
        alert =>
            alert.id === incidentId &&
            alert.studentId === student.studentId
    );

    container.replaceChildren();

    if (!incident) {
        container.textContent = "Incident not found.";
        return;
    }

    const fields = [
        ["Incident ID", incident.id],
        ["Student", incident.studentName],
        ["Created", formatDate(incident.createdAt)],
        ["Incident status", incident.status],
        ["Location status", incident.locationStatus],
        ["Security notification", incident.securityStatus],
        ["Emergency contact notification", incident.contactStatus]
    ];

    if (incident.latitude !== null && incident.longitude !== null) {
        fields.push([
            "Coordinates",
            `${incident.latitude}, ${incident.longitude}`
        ]);

        const mapLink = document.createElement("a");
        mapLink.href =
            `https://www.openstreetmap.org/?mlat=${incident.latitude}` +
            `&mlon=${incident.longitude}#map=18/${incident.latitude}/${incident.longitude}`;
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapLink.textContent = "View coordinates on OpenStreetMap";
        container.appendChild(mapLink);
    }

    fields.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = `${label}: ${value}`;
        container.appendChild(paragraph);
    });

    const historyHeading = document.createElement("h3");
    historyHeading.textContent = "Incident history";
    container.appendChild(historyHeading);

    (incident.history || []).forEach(entry => {
        const paragraph = document.createElement("p");
        paragraph.textContent =
            `${formatDate(entry.time)} - ${entry.event}`;
        container.appendChild(paragraph);
    });
}

// =======================================================
// 12. SECURITY DASHBOARD - DEMONSTRATION ONLY
// =======================================================

function loadSecurityDashboard() {
    const container = document.getElementById("securityAlerts");
    if (!container) return;

    container.replaceChildren();

    const alerts = getData(STORAGE.alerts, []);

    if (alerts.length === 0) {
        container.textContent = "No demo incidents recorded.";
        return;
    }

    alerts.forEach(alert => {
        const card = document.createElement("article");
        card.className = "alert-card";

        const title = document.createElement("h3");
        title.textContent = alert.id;

        const name = document.createElement("p");
        name.textContent = "Student: " + alert.studentName;

        const time = document.createElement("p");
        time.textContent = "Time: " + formatDate(alert.createdAt);

        const status = document.createElement("p");
        status.textContent = "Status: " + alert.status;

        const location = document.createElement("p");
        location.textContent =
            alert.latitude !== null && alert.longitude !== null
                ? `Coordinates: ${alert.latitude}, ${alert.longitude}`
                : "Location: unavailable";

        const demoLabel = document.createElement("p");
        demoLabel.textContent =
            "DEMO DATA ONLY - This dashboard is not connected to BAC security.";

        card.append(title, name, time, status, location, demoLabel);

        if (alert.latitude !== null && alert.longitude !== null) {
            const mapLink = document.createElement("a");
            mapLink.href =
                `https://www.openstreetmap.org/?mlat=${alert.latitude}` +
                `&mlon=${alert.longitude}#map=18/${alert.latitude}/${alert.longitude}`;
            mapLink.target = "_blank";
            mapLink.rel = "noopener noreferrer";
            mapLink.textContent = "View location";
            card.appendChild(mapLink);
        }

        const resolveButton = document.createElement("button");
        resolveButton.type = "button";
        resolveButton.textContent = "Resolve demo incident";

        resolveButton.addEventListener("click", () => {
            resolveDemoIncident(alert.id);
        });

        card.appendChild(resolveButton);
        container.appendChild(card);
    });
}

function resolveDemoIncident(incidentId) {
    if (!window.confirm("Resolve this DEMO incident?")) return;

    const alerts = getData(STORAGE.alerts, []);
    const incident = alerts.find(a => a.id === incidentId);

    if (!incident) return;

    incident.status = "RESOLVED - DEMO";
    incident.history.push({
        time: new Date().toISOString(),
        event: "Incident resolved in demonstration dashboard."
    });

    saveData(STORAGE.alerts, alerts);
    loadSecurityDashboard();

    showMessage("Demo incident marked as resolved.", "success");
}

// =======================================================
// 13. DEMO WEARABLE BUTTON
// =======================================================

function simulateWearableButton() {
    const confirmed = window.confirm(
        "Simulate pressing the BAC SAFE wearable panic button?"
    );

    if (confirmed) {
        triggerEmergency();
    }
}

// This function does not connect to real Bluetooth hardware.
// A real BLE implementation needs a compatible device,
// permission handling, a supported connection workflow,
// and a backend capable of receiving the emergency event.

// =======================================================
// 14. LOGOUT
// =======================================================

function logoutStudent() {
    localStorage.removeItem(STORAGE.currentUser);

    showMessage("You have been logged out.", "success");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 500);
}

// =======================================================
// 15. AUTOMATIC PAGE INITIALIZATION
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    // Registration form
    document.getElementById("registerForm")
        ?.addEventListener("submit", registerStudent);

    // Login form
    document.getElementById("loginForm")
        ?.addEventListener("submit", loginStudent);

    // Forgot password form
    document.getElementById("forgotPasswordForm")
        ?.addEventListener("submit", requestPasswordReset);

    // Demo reset form - demo only
    document.getElementById("resetPasswordForm")
        ?.addEventListener("submit", demoResetPassword);

    // Emergency contacts form
    document.getElementById("contactForm")
        ?.addEventListener("submit", addEmergencyContact);

    // SOS button
    document.getElementById("sosButton")
        ?.addEventListener("click", triggerEmergency);

    // Demo wearable
    document.getElementById("wearableDemoButton")
        ?.addEventListener("click", simulateWearableButton);

    // Logout buttons
    document.querySelectorAll("[data-logout]").forEach(button => {
        button.addEventListener("click", logoutStudent);
    });

    // Page-specific initialization
    if (document.getElementById("studentName")) {
        loadDashboard();
    }

    if (document.getElementById("campusMap")) {
        initializeCampusMap();
    }

    if (document.getElementById("incidentDetails")) {
        loadIncidentStatus();
    }

    if (document.getElementById("emergencyContactsList")) {
        renderEmergencyContacts();
    }

    if (document.getElementById("securityAlerts")) {
        loadSecurityDashboard();
    }
});
