# IT3030 – Programming Applications and Frameworks (PAF)  
**Assignment – 2026 (Semester 1)**  
**Group Coursework (Individual contribution assessed)**

---

## Important Details

- **Weight:** 30% of the final mark for IT3030  
- **Mode:** Group work; each member is assessed individually (marks may differ within a group)  
- **Assignment release date:** 24th March 2026  
- **Viva / Demonstration:** Starting 11th April 2026 (TBA)  
- **Submission deadline:** 11:45 PM (GMT +5:30), 27th April 2026 via Courseweb  
- **Required stack:** Spring Boot REST API + React client web application  
- **Version control:** GitHub repository + GitHub Actions workflow required  

---

## Assignment Description

Your team has been hired to design and implement a complete, production-inspired web system for a real-world business scenario. You must develop:

- A **Java (Spring Boot) REST API** using RESTful best practices (layered architecture, validation, error handling, security).  
- A **React-based client web application** that consumes your API and provides a usable UI for the required workflows.

---

## Business Scenario: Smart Campus Operations Hub

A university is modernizing its day-to-day operations. The university needs a single web platform to manage **facility and asset bookings** (rooms, labs, equipment) and **maintenance/incident handling** (fault reports, technician updates, resolutions). The platform must support a clear workflow, role-based access, and strong auditability.

---

## Core Features (Minimum Requirements)

### Module A – Facilities & Assets Catalogue
- Maintain a catalogue of bookable resources: lecture halls, labs, meeting rooms, and equipment (projectors, cameras, etc.).
- Each resource must have key metadata (type, capacity, location, availability windows, and status such as **ACTIVE / OUT_OF_SERVICE**).
- Support search and filtering (e.g., by type, capacity, and location).

### Module B – Booking Management
- Users can request a booking for a resource by providing date, time range, purpose, and expected attendees (where applicable).
- Bookings must follow a workflow: **PENDING → APPROVED/REJECTED**. Approved bookings can later be **CANCELLED**.
- The system must prevent scheduling conflicts for the same resource (overlapping time ranges).
- Admin users can review, approve, or reject booking requests with a reason.
- Users can view their own bookings; Admin can view all bookings (with filters).

### Module C – Maintenance & Incident Ticketing
- Users can create incident tickets for a specific resource/location with category, description, priority, and preferred contact details.
- Tickets can include up to **3 image attachments** (evidence such as a damaged projector or error screen).
- Ticket workflow: **OPEN → IN_PROGRESS → RESOLVED → CLOSED** (Admin may also set **REJECTED** with reason).
- A technician (or staff member) can be assigned to a ticket and can update status and add resolution notes.
- Users and staff can add comments; comment ownership rules must be implemented (edit/delete as appropriate).

### Module D – Notifications
- Users must receive notifications for booking approval/rejection, ticket status changes, and new comments on their tickets.
- Notifications must be accessible through the web UI (e.g., notification panel).

### Module E – Authentication & Authorization
- Implement **OAuth 2.0 login** (e.g., Google sign-in).
- At minimum, support roles: **USER** and **ADMIN**. You may add extra roles (e.g., **TECHNICIAN / MANAGER**) for better design.
- Secure endpoints using role-based access control and protect the front-end routes accordingly.

> **Note:** Your group may extend the system with additional value-adding features, but the **minimum requirements must be fully satisfied first**.

---

## Tasks in the Assignment

You must complete **all** of the following:

- **Requirements:** Identify functional requirements for both the REST API and client web application, and define key non-functional requirements (security, performance, scalability, usability).
- **Architecture Design:** Provide an overall system architecture diagram (excluding mobile apps), plus detailed diagrams for the REST API and front-end architectures.
- **Implementation:** Develop the Spring Boot REST API and React web application according to your designs; ensure clean architecture and maintainable code.
- **Testing & Quality:** Provide evidence of testing (unit/integration tests and/or Postman collections) and demonstrate robust validation and error handling.
- **Version Control & CI:** Host the project on GitHub and implement a GitHub Actions workflow (build + test; optionally package/deploy).

---

## Other Requirements

- The project must be version-controlled using Git and hosted on GitHub with an **active commit history**.
- **Each member must implement at least four (4) REST API endpoints** using different HTTP methods (GET, POST, PUT/PATCH, DELETE).
- Use consistent API naming, correct HTTP status codes, and meaningful error responses.
- Persist data using a database of your choice (SQL or NoSQL). Do **not** rely only on in-memory collections.
- Apply security best practices (authentication, authorization, input validation, safe file handling for attachments).
- **UI/UX quality matters:** your client app must be usable, clear, and logically structured.

---

## Recommended Work Allocation (to support individual assessment)

To make individual contribution visible, allocate modules clearly. For example:

- **Member 1:** Facilities catalogue + resource management endpoints  
- **Member 2:** Booking workflow + conflict checking  
- **Member 3:** Incident tickets + attachments + technician updates  
- **Member 4:** Notifications + role management + OAuth integration improvements  

> Your final repository and documentation must clearly indicate which member implemented which endpoints and UI components.

---

## Submission Artifacts

- **GitHub Repository Link:** Public or accessible to evaluators; include a clear **README** with setup steps.
- **Final Report (PDF):** Requirements, architecture diagrams, endpoint list, testing evidence, and team contribution summary.
- **Running System:** Demonstrable locally; optional deployment is encouraged but not mandatory.
- **Evidence:** Screenshots (or short video link) for key workflows and OAuth login.

---

## Naming & Packaging

- **Report file name:** `IT3030_PAF_Assignment_2026_GroupXX.pdf`
- **Repository name:** `it3030-paf-2026-smart-campus-groupXX`
- Do **not** include compiled files (e.g., `node_modules`, `target`) in the submission zip.

---

## Examples of Acceptable Innovation (Optional)

- QR code check-in for approved bookings (simple verification screen).
- Admin dashboard with usage analytics (top resources, peak booking hours).
- Service-level timer for tickets (time-to-first-response, time-to-resolution).
- Notification preferences (enable/disable categories).

---

## Academic Integrity & Viva Readiness

This assignment is designed to be assessed **individually** during progress review and viva. Any evidence of copying, repository duplication, or reusing seniors’ solutions will result in severe penalties, including the possibility of zero marks for the affected components.

- Each member must be able to explain their own endpoints, database design, and UI components.
- Ensure commit history reflects true individual work. Avoid single-day bulk commits.
- Keep your README and report consistent with what is implemented.

---

# Marking Rubric (Total: 100 Marks)

**Creativity (10 Marks)**  
Unique features, additional enhancements → **10 Marks**

**Special Notes**
- Academic integrity and honesty are strictly required.
- AI-generated code (Gemini, ChatGPT, etc.) is allowed, but usage **must be disclosed** in documentation and progress reviews.
- Submission deadline: **11:45 PM, 27th April 2026**.

---

### 1. DOCUMENTATION (15 Marks | Group)

| Criteria          | Excellent (12-15)                  | Good (8-11)                          | Needs Improvement (1-7)          | Not Acceptable (0)          |
|-------------------|------------------------------------|--------------------------------------|----------------------------------|-----------------------------|
| Final Document    | Clear, logical flow with well-structured sections | Generally well-organized with minor issues but could be improved | Sections are present but may be poorly structured | Content is largely irrelevant, and not structured |

---

### 2. REST API (30 Marks | Individual)

| Criteria                              | Excellent                          | Good                               | Needs Improvement                  | Not Acceptable |
|---------------------------------------|------------------------------------|------------------------------------|------------------------------------|----------------|
| Proper Endpoint Naming (5)            | Follows standard conventions (RESTful principles), meaningful, and consistent naming (5) | Mostly follows proper conventions but with minor inconsistencies (3-4) | Endpoint naming is inconsistent, lacks clarity, or does not fully follow RESTful principles (1-2) | Poor or no adherence to RESTful principles, unclear and ambiguous endpoint names (0) |
| Follows the Six REST Architectural Styles (10) | Fully adheres to all six REST architectural constraints (8-10) | Adheres to most REST constraints but has minor deviations (5-7) | Partially follows REST constraints but lacks key elements (1-4) | Does not follow REST principles or ignore major constraints (0) |
| Proper usage of HTTP methods and status codes (10) | Correct and consistent use of HTTP methods and status codes (7-10) | Mostly correct, but with minor issues in HTTP method selection or status code usage (4-6) | Some incorrect HTTP methods or status codes used inconsistently (1-3) | HTTP methods and status codes are used incorrectly or not considered (0) |
| Good code quality following Java/Spring coding conventions (5) | Code is clean, well-structured, follows Java and Spring best practices, with proper indentation, naming conventions, and documentation (5) | Mostly follows conventions, but minor issues in structure, naming, or documentation (3-4) | Some violations of Java/Spring coding standards, lacks readability and maintainability (1-2) | Poor code quality, does not follow Java/Spring conventions, difficult to read and maintain (0) |
| Satisfying all requirements (5)       | Fully implements all specified API functionalities, including authentication, CRUD operations, and validations, ensuring seamless integration with the client (5) | Implements most functionalities but may have minor missing features or incomplete validation (3-4) | Partially satisfies the requirements but lacks key functionalities or has major issues in implementation (1-2) | Does not meet the API requirements, missing critical functionalities or entirely non-functional (0) |

---

### 3. CLIENT WEB APPLICATION (15 Marks | Individual)

| Criteria                              | Excellent                          | Good                               | Needs Improvement                  | Not Acceptable |
|---------------------------------------|------------------------------------|------------------------------------|------------------------------------|----------------|
| Proper Architectural Design and Implementation (5) | Well-structured architecture, modularized components, follows best practices in React development, ensuring maintainability and scalability (5) | Mostly well-structured but with minor architectural flaws or less modularization (3-4) | Basic structure implemented but lacks modularization, making it difficult to maintain (1-2) | Poorly structured or non-functional application, does not follow best practices (0) |
| Satisfying all Requirements (5)       | Fully implements all required features, ensuring smooth functionality and seamless integration with the REST API (5) | Implements most features but may have minor missing functionalities or UI/UX inconsistencies (3-4) | Partially satisfies the requirements but lacks key features or has major usability issues (1-2) | Poorly Does not meet the application requirements, missing critical features or entirely non-functional (0) |
| Good UI/UX (10)                       | Excellent user interface design, visually appealing, intuitive layout, smooth navigation, and great user experience (7-10) | Good UI/UX but with minor inconsistencies in design, layout, or usability (4-6) | Basic UI/UX with several usability or aesthetic issues affecting the user experience (1-3) | Poor UI/UX, difficult to use, cluttered design, lacks visual appeal or usability considerations (0) |

---

### 4. VERSION CONTROLLING (10 Marks | Group)

| Criteria                              | Excellent                          | Good                               | Needs Improvement                  | Not Acceptable |
|---------------------------------------|------------------------------------|------------------------------------|------------------------------------|----------------|
| Proper Usage of Git (5)               | Uses Git effectively with meaningful commit messages, proper branching strategies, and collaborative workflows (5) | Mostly follows Git best practices but with minor inconsistencies in commits or branching (3-4) | Basic Git usage with occasional missing commit messages, poor branching structure (1-2) | Poor or no use of Git, lacks version control practices (0) |
| Proper Usage of the GitHub Workflow (5) | Fully utilizes GitHub Workflow for deployment with well-defined workflows (5) | Mostly uses GitHub Workflow effectively but may have minor deployment inefficiencies (3-4) | Basic use of GitHub Workflow for deployment or improper setup (1-2) | No implementation of GitHub Workflow (0) |

---

### 5. AUTHENTICATION (10 Marks | Group)

| Criteria                                      | Excellent                          | Good                               | Needs Improvement                  | Not Acceptable |
|-----------------------------------------------|------------------------------------|------------------------------------|------------------------------------|----------------|
| Implementing OAuth 2.0 Authentication (10)    | Fully implements OAuth authentication, ensuring secure login with proper token handling, user roles, and session management (8-10) | Implements OAuth authentication but may have minor security or integration flaws (5-7) | Partial OAuth implementation with missing features or security concerns (1-4) | No OAuth authentication implemented, or it is non-functional (0) |

---

### 6. INNOVATION / OUT OF THE BOX THINKING (10 Marks | Group)

| Criteria                                      | Excellent                          | Good                               | Needs Improvement                  | Not Acceptable |
|-----------------------------------------------|------------------------------------|------------------------------------|------------------------------------|----------------|
| Overall Creativity (10)                       | Demonstrates unique and innovative features, enhancing user engagement and functionality beyond basic requirements (8-10) | Includes some creative elements but mostly follows standard implementation (5-7) | Limited creativity, minimal enhancements beyond the basic requirements (1-4) | No creativity, only implements basic requirements with no additional innovation (0) |

---

**End of Assignment & Marking Rubric**

---

**How to use this file:**
1. Copy everything above.
2. Paste into a new file named `IT3030_PAF_Assignment_2026.md`.
3. Save and open in any Markdown viewer (VS Code, Typora, GitHub, etc.).

You now have a clean, searchable, and nicely formatted version of both the assignment brief and the full marking rubric!  
Let me know if you want me to split it into two separate .md files or add any extra sections (e.g., your group contribution table).