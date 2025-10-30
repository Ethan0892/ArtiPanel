import React from 'react';
import { evaluatePasswordStrength, getStrengthColor, getStrengthLabel } from '../utils/passwordStrength';
import '../styles/passwordStrength.css';

interface PasswordStrengthMeterProps {
  password: string;
  showLabel?: boolean;
  showFeedback?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showLabel = true,
  showFeedback = true,
}) => {
  const result = evaluatePasswordStrength(password);
  const strengthColor = getStrengthColor(result.strength);
  const strengthLabel = getStrengthLabel(result.strength);

  // Only show meter if password has content
  if (!password) {
    return null;
  }

  return (
    <div className="password-strength-meter">
      <div className="strength-bar-container">
        <div
          className="strength-bar"
          style={{
            width: `${(result.score / 5) * 100}%`,
            backgroundColor: strengthColor,
          }}
        />
      </div>

      {showLabel && (
        <div className="strength-label" style={{ color: strengthColor }}>
          Strength: {strengthLabel}
        </div>
      )}

      {showFeedback && result.feedback.length > 0 && (
        <div className="strength-feedback">
          {result.feedback.map((item, index) => (
            <div key={index} className="feedback-item">
              {item.startsWith('✓') ? (
                <span className="feedback-positive">{item}</span>
              ) : (
                <span className="feedback-suggestion">{item}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
