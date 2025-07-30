export interface Instructor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company_id: number;
    is_active: boolean;
    created_at: string;
}
export interface InstructorOption {
    user_id: number;
    first_name: string;
    last_name: string;
    display_name: string;
}

export function getInstructorDisplayName(instructor: Instructor): string {
  return `${instructor.first_name} ${instructor.last_name}`.trim();
}

export function instructorToOption(instructor: Instructor): InstructorOption {
  return {
    user_id: instructor.id,
    first_name: instructor.first_name,
    last_name: instructor.last_name,
    display_name: getInstructorDisplayName(instructor)
  };
}