import React from 'react';
import './CVPreview.css';

const CVPreview = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="cv-preview">
      <div className="cv-document">
        {/* Header */}
        <div className="cv-header">
          <h1>{data.personalInfo?.fullName || 'Your Name'}</h1>
          <div className="contact-info">
            {data.personalInfo?.email && <span>✉ {data.personalInfo.email}</span>}
            {data.personalInfo?.phone && <span>Phone: {data.personalInfo.phone}</span>}
            {data.personalInfo?.city && data.personalInfo?.country && (
              <span>📍 {data.personalInfo.city}, {data.personalInfo.country}</span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {data.personalInfo?.summary && (
          <div className="cv-section">
            <h2>PROFESSIONAL SUMMARY</h2>
            <p className="summary-text">{data.personalInfo.summary}</p>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="cv-section">
            <h2>SKILLS</h2>
            <div className="skills-columns">
              {data.skills.map((skill, index) => (
                <div key={index} className="skill-bullet">
                  • {skill.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="cv-section">
            <h2>EDUCATION</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="cv-item">
                <div className="item-header">
                  <div className="item-left">
                    <h3>{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                    <p className="institution">{edu.institution}</p>
                  </div>
                  <div className="item-right">
                    {(edu.startDate || edu.endDate) && (
                      <p className="date">
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </p>
                    )}
                    {edu.location && <p className="location">{edu.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="cv-section">
            <h2>WORK EXPERIENCE</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="cv-item">
                <div className="item-header">
                  <div className="item-left">
                    <h3>{exp.position}</h3>
                    <p className="institution">{exp.company}</p>
                  </div>
                  <div className="item-right">
                    {(exp.startDate || exp.endDate) && (
                      <p className="date">
                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </p>
                    )}
                    {exp.location && <p className="location">{exp.location}</p>}
                  </div>
                </div>
                {exp.description && <p className="description">{exp.description}</p>}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="responsibilities-list">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Professional Licenses & Certifications */}
        {data.licensing && data.licensing.length > 0 && (
          <div className="cv-section">
            <h2>LICENSES & CERTIFICATIONS</h2>
            {data.licensing.map((license, index) => (
              <div key={index} className="cv-item">
                <div className="item-header">
                  <div>
                    <h3>{license.name}</h3>
                    <p className="institution">{license.issuingOrganization}</p>
                  </div>
                  <div className="date-location">
                    {license.issueDate && (
                      <p className="date">
                        Issued: {formatDate(license.issueDate)}
                        {license.expiryDate && ` | Expires: ${formatDate(license.expiryDate)}`}
                      </p>
                    )}
                    {license.credentialId && <p className="location">ID: {license.credentialId}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div className="cv-section">
            <h2>LANGUAGES</h2>
            <div className="skills-columns">
              {data.languages.map((language, index) => (
                <div key={index} className="skill-bullet">
                  • {language.name} ({language.proficiency})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies & Interests */}
        {data.hobbies && (
          <div className="cv-section">
            <h2>HOBBIES & INTERESTS</h2>
            <p className="summary-text">{data.hobbies}</p>
          </div>
        )}

        {/* References */}
        {data.references && data.references.length > 0 && (
          <div className="cv-section">
            <h2>REFERENCES</h2>
            {data.references.map((reference, index) => (
              <div key={index} className="cv-item">
                <div className="reference-item">
                  <h3>{reference.name}</h3>
                  <p className="institution">{reference.position} {reference.company && `at ${reference.company}`}</p>
                  <div className="reference-contact">
                    {reference.phone && <span>Phone: {reference.phone}</span>}
                    {reference.email && <span>✉ {reference.email}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CVPreview;
