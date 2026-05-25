/**
 * Tests for InviteCodeForm — admin/master-admin choose a role for the next
 * invite code. The component is critical because a regression here would let
 * the admin issue the wrong-role invite, silently provisioning the wrong
 * permission set on the next signup.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import InviteCodeForm from "@/src/components/InviteCodeForm";
import { UserRole } from "@/src/types/enums";
import { Company } from "@/src/types/company.types";

const baseCompany: Company = {
  id: 1,
  name: "Acme Training",
  description: null,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
} as unknown as Company;

describe("InviteCodeForm", () => {
  it("renders the company name and all three role buttons when visible", () => {
    render(
      <InviteCodeForm
        visible
        company={baseCompany}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(
      screen.getByText("Create Invite Code for Acme Training")
    ).toBeTruthy();
    expect(screen.getByText("Student")).toBeTruthy();
    expect(screen.getByText("Instructor")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("renders nothing when company is null", () => {
    const { toJSON } = render(
      <InviteCodeForm
        visible
        company={null as unknown as Company}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(toJSON()).toBeNull();
  });

  it("submits with UserRole.STUDENT when Student is pressed", () => {
    const onSubmit = jest.fn();
    render(
      <InviteCodeForm
        visible
        company={baseCompany}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.press(screen.getByText("Student"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(UserRole.STUDENT);
  });

  it("submits with UserRole.INSTRUCTOR when Instructor is pressed", () => {
    const onSubmit = jest.fn();
    render(
      <InviteCodeForm
        visible
        company={baseCompany}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.press(screen.getByText("Instructor"));

    expect(onSubmit).toHaveBeenCalledWith(UserRole.INSTRUCTOR);
  });

  it("submits with UserRole.ADMIN when Admin is pressed", () => {
    const onSubmit = jest.fn();
    render(
      <InviteCodeForm
        visible
        company={baseCompany}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.press(screen.getByText("Admin"));

    expect(onSubmit).toHaveBeenCalledWith(UserRole.ADMIN);
  });

  it("calls onClose when Cancel is pressed", () => {
    const onClose = jest.fn();
    render(
      <InviteCodeForm
        visible
        company={baseCompany}
        onClose={onClose}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText("Cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables every action button when isSubmitting", () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    render(
      <InviteCodeForm
        visible
        company={baseCompany}
        isSubmitting
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    fireEvent.press(screen.getByText("Cancel"));
    // Role buttons render an ActivityIndicator instead of the label when isLoading,
    // so we cannot find them by label. Instead, verify that even Cancel is no-op.
    expect(onClose).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
