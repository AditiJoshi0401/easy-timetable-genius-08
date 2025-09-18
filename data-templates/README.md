This folder contains CSV templates and a helper script to convert CSV -> JSON for importing data into Timetable Genius.

Overview
- Each entity has a CSV template with a header row and an example row.
- For array-type fields (like `streams`, `subjects`, `roles`, `rooms`) use a semicolon (`;`) as the separator inside the CSV cell to avoid conflicts with CSV comma separators.
- Save Excel worksheets as CSV (UTF-8) from Excel/LibreOffice and keep the semicolon convention for list fields.

Templates included
- `subjects.csv`  -> Subject records
- `teachers.csv`  -> Teacher records
- `rooms.csv`     -> Room records
- `streams.csv`   -> Stream records
- `divisions.csv` -> Division records
- `roles.csv`     -> Role records

Field notes and expectations

Subjects (`subjects.csv`)
- id: (optional) internal id; if left blank your import can let the DB create IDs.
- name: Subject name (required)
- code: Short code (e.g., CS101) — used to link subjects to streams in `streams` field.
- credits: numeric
- streams: semicolon-separated list of stream codes (NOT stream ids). Example: `ENG;SCI`
- semester: integer (1,2,...)
- lectures, tutorials, practicals: integers (counts)

Teachers (`teachers.csv`)
- id: optional
- name: full name (required)
- email: email address
- specialization: text
- subjects: semicolon-separated list of subject *ids* OR *codes* (prefer ids if you have them). Example: `subj-id-1;subj-id-2` or `CS101;CS102`.
- isTA: true/false
- roles: semicolon-separated list of role names or ids
- cabin: text (room number for cabin)
- maxLectures, maxLabs, maxTutorials: numeric limits

Rooms (`rooms.csv`)
- id: optional
- number: room number or name (required)
- capacity: integer
- type: `classroom` or `lab`

Streams (`streams.csv`)
- id: optional
- code: unique short code (used in `subjects.streams`), e.g., `ENG`, `SCI`
- name: full name of stream
- semesters: integer (number of semesters)

Divisions (`divisions.csv`)
- id: optional
- streamId: the `id` of the stream (if not available, you can use the stream `code` and convert later)
- name: division name (e.g., A, B)
- strength: numeric
- semester: integer

Roles (`roles.csv`)
- id: optional
- name: short name (e.g., `HOD`, `LAB_ASST`)
- description: text

Conversion notes
- Use semicolons (`;`) inside array cells to separate items.
- Save each sheet as UTF-8 CSV from Excel/LibreOffice ("CSV UTF-8 (Comma delimited)"), then run the provided Node script to produce JSON.
- The script is intentionally simple; it will:
  - Parse CSV by splitting lines and commas
  - Split known array fields by semicolon into JS arrays
  - Trim whitespace
- For robust parsing (handles quoted fields containing commas) use a CSV parsing library (e.g., `csv-parse` or `papaparse`).

Uploading the JSON
- The repo includes placeholder import functions (see `src/services/supabaseService.ts`). If your backend import endpoints expect a certain payload, ensure the JSON matches the service interfaces. For `teachers.subjects`, prefer subject IDs; if you used subject codes, you'll need an intermediate mapping step.

Support
- If you want, I can:
  - Produce a more robust converter using `csv-parse` and mapping by code -> id (requires Node dependency install), or
  - Create an Excel `.xlsx` workbook with separate sheets (if you want a single file instead of multiple CSVs).

Files below are safe to open in Excel. Edit rows, save as CSV, and use the `scripts/convert-csv-to-json.js` helper to generate JSON.
