// Two-field (first + last) name entry with a confirm chip. Shared by the
// submission chat and the voting page so "credit me" captures a name the same
// way in both places. Confirm is disabled until a first name is typed; Enter
// submits.
export default function CreditNameEntry({
  firstName, lastName, onFirstChange, onLastChange, onConfirm, confirmLabel,
}) {
  const canConfirm = firstName.trim().length > 0;
  const submitOnEnter = (e) => { if (e.key === 'Enter' && canConfirm) onConfirm(); };
  return (
    <div className="v4-credit-name">
      <input
        type="text"
        className="v4-settings-input v4-credit-name-input"
        value={firstName}
        onChange={(e) => onFirstChange(e.target.value)}
        onKeyDown={submitOnEnter}
        placeholder="First name"
        aria-label="First name"
        autoFocus
      />
      <input
        type="text"
        className="v4-settings-input v4-credit-name-input"
        value={lastName}
        onChange={(e) => onLastChange(e.target.value)}
        onKeyDown={submitOnEnter}
        placeholder="Last name"
        aria-label="Last name"
      />
      <button
        type="button"
        className="v4-chip v4-credit-name-confirm"
        onClick={onConfirm}
        disabled={!canConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
