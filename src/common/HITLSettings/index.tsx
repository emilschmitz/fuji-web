import React, { useState } from "react";
import { Button, Text, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { useAppState } from "../../state/store";
import NewHITLForm from "./NewHITLForm";
import CheckpointItem from "./CheckpointItem";
import type { CheckpointRule } from "../../helpers/hitl";

const HITLSettings = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRule, setEditRule] = useState<CheckpointRule | undefined>(
    undefined,
  );

  const { hitlRules, updateSettings } = useAppState((state) => ({
    hitlRules: state.settings.hitlRules,
    updateSettings: state.settings.actions.update,
  }));

  const closeForm = () => {
    setEditRule(undefined);
    setIsFormOpen(false);
  };

  const handleSaveRule = (rule: Omit<CheckpointRule, "id">) => {
    if (editRule) {
      // Update existing rule
      const updatedRules = hitlRules.map((r) =>
        r.id === editRule.id ? { ...rule, id: editRule.id } : r,
      ) as CheckpointRule[];
      updateSettings({ hitlRules: updatedRules });
    } else {
      // Add new rule
      const newRule: CheckpointRule = {
        ...rule,
        id: crypto.randomUUID(),
      };
      updateSettings({ hitlRules: [...hitlRules, newRule] });
    }
    closeForm();
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = hitlRules.filter((rule) => rule.id !== id);
    updateSettings({ hitlRules: updatedRules });
  };

  const openEditForm = (rule: CheckpointRule) => {
    setEditRule(rule);
    setIsFormOpen(true);
  };

  return (
    <VStack spacing={4}>
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Text>
          {" "}
          Add checkpoints to make Fuji ask for your permission before performing
          certain actions.
        </Text>
      </Alert>
      {hitlRules.length > 0 ? (
        hitlRules.map((rule) => (
          <CheckpointItem
            key={rule.id}
            rule={rule}
            onEdit={openEditForm}
            onDelete={handleDeleteRule}
          />
        ))
      ) : (
        <Text>No safety checkpoints configured</Text>
      )}
      <Button onClick={() => setIsFormOpen(true)}>Add Safety Checkpoint</Button>
      {isFormOpen && (
        <NewHITLForm
          isOpen={isFormOpen}
          isEditMode={!!editRule}
          editRule={editRule}
          closeForm={closeForm}
          onSave={handleSaveRule}
        />
      )}
    </VStack>
  );
};

export default HITLSettings;
