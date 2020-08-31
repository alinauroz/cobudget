import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";

import Button from "components/Button";
import { AddIcon } from "components/Icons";

import AddOrEditGuideline from "./EditGuideline";
import DraggableGuidelines from "./DraggableGuidelines";

export default ({ event }) => {
  const [addGuidelineModalOpen, setAddGuidelineModalOpen] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(undefined);

  return (
    <div className="px-6">
      <h1 className="text-2xl font-semibold mb-2">Guidelines</h1>
      <p className="text-gray-700 mb-4">
        Set up the guidelines that dreams should follow.
      </p>

      <DraggableGuidelines
        event={event}
        guidelines={event.guidelines}
        setEditingGuideline={setEditingGuideline}
      />

      <div className="flex my-2">
        <Button
          variant="secondary"
          onClick={() => setAddGuidelineModalOpen(true)}
          className="flex-grow"
        >
          <AddIcon className="h-5 w-5 mr-1" /> Add guideline
        </Button>
      </div>
      {(addGuidelineModalOpen || editingGuideline) && (
        <AddOrEditGuideline
          event={event}
          guideline={editingGuideline}
          handleClose={() => {
            setAddGuidelineModalOpen(false);
            setEditingGuideline(undefined);
          }}
        />
      )}
    </div>
  );
};
