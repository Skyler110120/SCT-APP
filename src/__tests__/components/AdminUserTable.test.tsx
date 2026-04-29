import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import UserTable from "@/src/components/user/AdminUserTable";
import { UserRole } from "@/src/types/enums";

const baseUser = {
  id: 11,
  email: "pending.instructor@example.com",
  first_name: "Pending",
  last_name: "Instructor",
  role: UserRole.INSTRUCTOR,
  company_id: 1,
  instructor_id: null,
  has_completed_onboarding: true,
  is_active: true,
  is_approved: false,
};

describe("AdminUserTable", () => {
  it("shows pending badge and approve action for unapproved instructor/admin", () => {
    const onApproveAction = jest.fn();

    render(
      <UserTable
        users={[baseUser]}
        onRemoveAction={jest.fn()}
        onRoleAction={jest.fn()}
        onApproveAction={onApproveAction}
      />
    );

    expect(screen.getByText("Pending Approval")).toBeTruthy();
    const approveButton = screen.getByText("Approve Access");
    fireEvent.press(approveButton);
    expect(onApproveAction).toHaveBeenCalledWith(baseUser);
  });

  it("hides approve action for already approved users", () => {
    render(
      <UserTable
        users={[{ ...baseUser, is_approved: true }]}
        onRemoveAction={jest.fn()}
        onRoleAction={jest.fn()}
        onApproveAction={jest.fn()}
      />
    );

    expect(screen.queryByText("Pending Approval")).toBeNull();
    expect(screen.queryByText("Approve Access")).toBeNull();
  });
});
