# MindSpace
A virtual space where ideas can grow and develop.

# Creative Project Management SaaS

## Description
This project is a lightweight SaaS application designed for managing creative projects. Users can create projects, add notes, upload images, and visually organize their ideas using a simple Kanban-style board. The focus is on minimalism, with a strong emphasis on sleek design and user experience inspired by [Koto Studio](https://koto.studio/work/bolt/).

## Technologies
We use **Supabase** as the core backend service, handling the database, user authentication, file storage, and hosting. Below is the tech stack:

### Frontend
- **React** with **Next.js**: For building interactive user interfaces and server-side rendering.
- **Tailwind CSS** with shadcn components (or **Styled Components**): For creating highly customizable and responsive styles.
- **Framer Motion**: For implementing fluid animations and transitions.
- **GraphQL**: (Optional) For flexible data querying if required.

### Backend and Hosting
- **Supabase**: Used for handling all backend functionality, including:
  - **PostgreSQL database**: For managing project data.
  - **ORM**: Use Drizzle as ORM
  - **User authentication**: Secure user login and registration.
  - **Storage**: For managing user-uploaded images.
  - **API hosting**: Supabase functions or built-in APIs for managing project interactions.

## DB schema on Supabase ##
These are the tables created on supabase:

- **Users**
create table users (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    full_name text,
    created_at timestamp default now()
);

- **Projects**
create table projects (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade,
    title text not null,
    description text,
    created_at timestamp default now()
);

- **Notes**
create table notes (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references projects(id) on delete cascade,
    content text not null,
    created_at timestamp default now()
);

- **Tasks**
create table tasks (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references projects(id) on delete cascade,
    title text not null,
    description text,
    status text check (status in ('To Do', 'In Progress', 'Completed')) default 'To Do',
    position int,  -- Per ordinare le attività nella colonna
    created_at timestamp default now()
);

- **Images**
create table images (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references projects(id) on delete cascade,
    image_url text not null,
    uploaded_at timestamp default now()
);

## Features
- **Project Dashboard**: Displays all projects created by the user.
- **Notes Section**: Allows users to add text-based notes to their projects.
- **Image Upload**: Users can upload images related to their projects.
- **Kanban Board**: Users can manage project tasks in a drag-and-drop board with columns like "To Do," "In Progress," and "Completed."

## Implementation Tasks

### 1. Project Dashboard
- **Task**: Create a dashboard to list all the projects associated with the authenticated user.
  - Use Supabase's **user authentication** to identify the logged-in user.
  - Query the **PostgreSQL** database to fetch all projects belonging to the user.
  - Display the project list in a grid or list format, with project titles and basic details.
  - Include a button to create a new project. When clicked, trigger a form/modal that allows users to input a project title and description, saving it to the Supabase database.

### 2. Notes Section
- **Task**: Allow users to add and manage notes within a project.
  - Within each project page, create a section for **text notes**.
  - Use a **textarea input** to let users write their ideas or notes.
  - Save each note in the Supabase database, linked to the project ID.
  - Display the saved notes dynamically beneath the input field.
  - Provide options to edit or delete existing notes, using Supabase's database API to update or remove records.

### 3. Image Upload
- **Task**: Enable users to upload images related to their projects.
  - Within each project page, implement an **image uploader**.
  - Use Supabase’s **Storage API** to handle image file uploads.
  - Once an image is uploaded, store the file URL in the database associated with the project.
  - Display uploaded images in a grid layout, allowing users to view them within the project.
  - Optionally, provide functionality to delete images, removing them from both Supabase storage and the database.

### 4. Kanban Board
- **Task**: Build a simple drag-and-drop Kanban board to manage project tasks.
  - Define three columns: "To Do," "In Progress," and "Completed."
  - Allow users to add **tasks/cards** to each column.
  - Use Supabase’s database to store tasks, associating them with the project and their current status (column).
  - Implement **drag-and-drop functionality** (you can use libraries like `react-beautiful-dnd` or `react-dnd`) to move tasks between columns.
  - Update task status in the database when a task is moved.
  - Tasks should be retrieved dynamically from the database and displayed in the correct column based on their status.

### 5. User Authentication
- **Task**: Implement user authentication to manage access to the application.
  - Use Supabase's **Authentication API** to allow users to register, log in, and log out.
  - Protect routes like the dashboard and project pages so only authenticated users can access them.
  - On login, fetch and display user-specific projects and tasks.

### 6. Responsive Design and Mobile Support
- **Task**: Ensure the application is fully responsive and works seamlessly across devices.
  - Use **Tailwind CSS** (or Styled Components) to create a responsive layout that adapts to different screen sizes.
  - Ensure touch interactions for the drag-and-drop Kanban board work on mobile devices.

### 7. Animations and Transitions
- **Task**: Use **Framer Motion** to create fluid animations for UI interactions.
  - Add animations to modals, project transitions, and task movements on the Kanban board.
  - Focus on smooth transitions between states to improve the overall user experience.

## Future Enhancements
- **Collaboration**: Add the ability for multiple users to collaborate on the same project.
- **Project Sharing**: Implement a feature that allows users to share a project link with others.
- **Project Templates**: Provide pre-defined project templates for users to quickly start a new project with example tasks and notes.
- **Notifications**: Add reminders and notification features for tasks with deadlines.

## License
This project is open-source and available under the MIT License.