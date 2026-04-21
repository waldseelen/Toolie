"use client";

import { useRouter } from "next/navigation";

interface SubmissionActionsProps {
  submissionId: string;
}

export function SubmissionActions({ submissionId }: SubmissionActionsProps) {
  const router = useRouter();

  const updateSubmission = async (action: "approve" | "reject") => {
    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      alert("Submission action failed.");
      return;
    }

    router.refresh();
  };

  return (
    <>
      <button type="button" onClick={() => void updateSubmission("approve")}>
        Approve
      </button>
      <button type="button" onClick={() => void updateSubmission("reject")}>
        Reject
      </button>
    </>
  );
}
