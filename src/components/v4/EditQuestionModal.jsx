// V4 edit-question modal — opened from the brief recap on ContestManage.
// User clicks any answer row → this modal opens with the question prompt
// and the appropriate input type (reusing QuestionInput renderer). Save
// updates that single answer + closes. Cancel exits without changes.

import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import QuestionInput from './QuestionInput';
import '../../styles/landing-v3.css';

export default function EditQuestionModal({
  open,
  question,
  currentAnswer,
  onClose,
  onSave,
}) {
  if (!open || !question) return null;

  const handleSubmit = (newValue) => {
    onSave?.(newValue);
    onClose?.();
  };

  return (
    <div className="v4 lp-v3 v4-auth-backdrop" onClick={onClose}>
      <div
        className="v4-edit-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-edit-title"
      >
        <button
          type="button"
          className="v4-auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

        <div className="v4-edit-modal-label">
          {question.label || 'Edit answer'}
        </div>
        <h2 id="v4-edit-title" className="v4-edit-modal-prompt">
          {question.prompt || question.label}
        </h2>

        {currentAnswer !== undefined && currentAnswer !== '' && (
          <div className="v4-edit-modal-current">
            <span className="v4-edit-modal-current-label">Current:</span>
            <span className="v4-edit-modal-current-value">
              {formatAnswerForDisplay(currentAnswer)}
            </span>
          </div>
        )}

        <div className="v4-edit-modal-input">
          <QuestionInput
            question={question}
            onSubmit={handleSubmit}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

function formatAnswerForDisplay(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (Array.isArray(value)) return value.join(' · ');
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No';
      if (value.text) return value.text;
      if (value.name) return value.name;
      return 'Yes';
    }
  }
  return String(value);
}
