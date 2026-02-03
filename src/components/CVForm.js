import React, { useState } from 'react';
import './CVForm.css';
import API_BASE_URL from '../config';

const CVForm = ({ onDataChange, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: initialData.personalInfo?.fullName || '',
      email: initialData.personalInfo?.email || '',
      phone: initialData.personalInfo?.phone || '',
      address: initialData.personalInfo?.address || '',
      city: initialData.personalInfo?.city || 'Lusaka',
      country: initialData.personalInfo?.country || 'Zambia',
      profession: initialData.personalInfo?.profession || '',
      yearsExperience: initialData.personalInfo?.yearsExperience || '',
      specialization: initialData.personalInfo?.specialization || '',
      summary: initialData.personalInfo?.summary || ''
    },
    skills: initialData.skills || [],
    education: initialData.education || [],
    experience: initialData.experience || [],
    licensing: initialData.licensing || [],
    languages: initialData.languages || [],
    hobbies: initialData.hobbies || '',
    references: initialData.references || []
  });
  const [aiLoading, setAiLoading] = useState({ summary: false, skills: false });

  const handleInputChange = (section, field, value) => {
    const updatedData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  const handleArrayAdd = (section) => {
    const newItem = section === 'education' 
      ? { institution: '', degree: '', field: '', startDate: '', endDate: '', location: '' }
      : section === 'experience'
      ? { company: '', position: '', startDate: '', endDate: '', location: '', description: '', responsibilities: [] }
      : section === 'skills'
      ? { name: '', level: 'Intermediate' }
      : section === 'licensing'
      ? { name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '' }
      : section === 'languages'
      ? { name: '', proficiency: 'Intermediate' }
      : section === 'references'
      ? { name: '', position: '', company: '', phone: '', email: '' }
      : {};

    const updatedData = {
      ...formData,
      [section]: [...formData[section], newItem]
    };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  const handleArrayChange = (section, index, field, value) => {
    const updatedArray = [...formData[section]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    const updatedData = { ...formData, [section]: updatedArray };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  const handleArrayRemove = (section, index) => {
    const updatedArray = formData[section].filter((_, i) => i !== index);
    const updatedData = { ...formData, [section]: updatedArray };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  const generateAISummary = async () => {
    if (!formData.personalInfo.profession) {
      alert('Please enter your profession first');
      return;
    }

    setAiLoading({ ...aiLoading, summary: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/suggest-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: formData.personalInfo.profession,
          yearsExperience: formData.personalInfo.yearsExperience || 0,
          specialization: formData.personalInfo.specialization || ''
        })
      });

      const data = await response.json();
      if (response.ok) {
        handleInputChange('personalInfo', 'summary', data.summary);
      } else {
        alert(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('AI Summary Error:', error);
      alert('Failed to connect to AI service');
    } finally {
      setAiLoading({ ...aiLoading, summary: false });
    }
  };

  const generateAISkills = async () => {
    if (!formData.personalInfo.profession) {
      alert('Please enter your profession first');
      return;
    }

    setAiLoading({ ...aiLoading, skills: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/suggest-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: formData.personalInfo.profession,
          specialization: formData.personalInfo.specialization || ''
        })
      });

      const data = await response.json();
      if (response.ok) {
        const updatedData = { ...formData, skills: data.skills.map(s => ({ ...s, level: 'Intermediate' })) };
        setFormData(updatedData);
        onDataChange(updatedData);
      } else {
        alert(data.error || 'Failed to generate skills');
      }
    } catch (error) {
      console.error('AI Skills Error:', error);
      alert('Failed to connect to AI service');
    } finally {
      setAiLoading({ ...aiLoading, skills: false });
    }
  };

  const generateResponsibilities = async (index) => {
    const exp = formData.experience[index];
    if (!exp.position) {
      alert('Please enter position first');
      return;
    }

    setAiLoading({ ...aiLoading, [`responsibilities_${index}`]: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/suggest-responsibilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: exp.position,
          company: exp.company || '',
          profession: formData.personalInfo.profession || '',
          yearsExperience: formData.personalInfo.yearsExperience || 0
        })
      });

      const data = await response.json();
      if (response.ok) {
        handleArrayChange('experience', index, 'responsibilities', data.responsibilities);
      } else {
        alert(data.error || 'Failed to generate responsibilities');
      }
    } catch (error) {
      console.error('AI Responsibilities Error:', error);
      alert('Failed to connect to AI service');
    } finally {
      setAiLoading({ ...aiLoading, [`responsibilities_${index}`]: false });
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="cv-form">
      <div className="form-progress">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Personal</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Skills</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>Education</div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>Experience</div>
        <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>Optional</div>
      </div>

      <div className="form-content">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.personalInfo.fullName}
                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                placeholder="John Mwamba"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  placeholder="+260 XXX XXX XXX"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Profession/Job Title</label>
                <input
                  type="text"
                  value={formData.personalInfo.profession}
                  onChange={(e) => handleInputChange('personalInfo', 'profession', e.target.value)}
                  placeholder="e.g., Nurse, Software Developer, Teacher"
                />
                <small style={{color: '#666', fontSize: '12px'}}>AI will use this to suggest summary and skills</small>
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  value={formData.personalInfo.yearsExperience}
                  onChange={(e) => handleInputChange('personalInfo', 'yearsExperience', e.target.value)}
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Specialization (Optional)</label>
              <input
                type="text"
                value={formData.personalInfo.specialization}
                onChange={(e) => handleInputChange('personalInfo', 'specialization', e.target.value)}
                placeholder="e.g., Pediatric Care, Web Development, Secondary Education"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.personalInfo.address}
                onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                placeholder="123 Independence Avenue"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.personalInfo.city}
                  onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                  placeholder="Lusaka"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.personalInfo.country}
                  onChange={(e) => handleInputChange('personalInfo', 'country', e.target.value)}
                  placeholder="Zambia"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Professional Summary</label>
              <textarea
                value={formData.personalInfo.summary}
                onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                placeholder="Brief summary of your professional background and career goals..."
                rows="4"
              />
              <button 
                type="button" 
                onClick={generateAISummary}
                className="ai-btn"
                disabled={aiLoading.summary || !formData.personalInfo.profession}
              >
                {aiLoading.summary ? 'Generating...' : 'AI Generate Summary'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Skills</h2>
            <div style={{ marginBottom: '20px' }}>
              <button 
                type="button" 
                onClick={generateAISkills}
                className="ai-btn"
                disabled={aiLoading.skills || !formData.personalInfo.profession}
                style={{ width: '100%' }}
              >
                {aiLoading.skills ? 'Generating Skills...' : 'AI Suggest Skills for ' + (formData.personalInfo.profession || 'Your Profession')}
              </button>
              {!formData.personalInfo.profession && (
                <small style={{color: '#999', display: 'block', marginTop: '8px'}}>
                  Enter your profession in Step 1 to use suggestions
                </small>
              )}
            </div>
            {formData.skills.map((skill, index) => (
              <div key={index} className="array-item skill-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Skill Name *</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)}
                      placeholder="JavaScript, Communication, etc."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={skill.level}
                      onChange={(e) => handleArrayChange('skills', index, 'level', e.target.value)}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => handleArrayRemove('skills', index)} className="remove-btn-inline">
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => handleArrayAdd('skills')} className="add-btn">
              + Add Skill
            </button>
          </div>
        )}

        {/* Step 3: Education */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Education</h2>
            {formData.education.map((edu, index) => (
              <div key={index} className="array-item">
                <div className="item-header">
                  <h3>Education {index + 1}</h3>
                  <button type="button" onClick={() => handleArrayRemove('education', index)} className="remove-btn">
                    Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Institution *</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                    placeholder="University of Zambia"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleArrayChange('education', index, 'field', e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => handleArrayChange('education', index, 'location', e.target.value)}
                    placeholder="Lusaka, Zambia"
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => handleArrayAdd('education')} className="add-btn">
              + Add Education
            </button>
          </div>
        )}

        {/* Step 4: Experience */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>Work Experience</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="array-item">
                <div className="item-header">
                  <h3>Experience {index + 1}</h3>
                  <button type="button" onClick={() => handleArrayRemove('experience', index)} className="remove-btn">
                    Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                    placeholder="Company Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)}
                    placeholder="Software Developer"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)}
                    placeholder="Lusaka, Zambia"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Key Responsibilities (High-Impact Bullets)</label>
                  <button 
                    type="button" 
                    onClick={() => generateResponsibilities(index)}
                    className="ai-btn"
                    disabled={aiLoading[`responsibilities_${index}`] || !exp.position}
                    style={{ marginBottom: '10px' }}
                  >
                    {aiLoading[`responsibilities_${index}`] ? 'Generating...' : 'AI Generate Responsibilities'}
                  </button>
                  {exp.responsibilities && exp.responsibilities.map((resp, respIndex) => (
                    <div key={respIndex} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => {
                          const newResp = [...exp.responsibilities];
                          newResp[respIndex] = e.target.value;
                          handleArrayChange('experience', index, 'responsibilities', newResp);
                        }}
                        placeholder="Led team of 15 staff..."
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newResp = exp.responsibilities.filter((_, i) => i !== respIndex);
                          handleArrayChange('experience', index, 'responsibilities', newResp);
                        }}
                        className="remove-btn-inline"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newResp = [...(exp.responsibilities || []), ''];
                      handleArrayChange('experience', index, 'responsibilities', newResp);
                    }}
                    style={{ fontSize: '14px', padding: '5px 10px' }}
                  >
                    + Add Responsibility
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => handleArrayAdd('experience')} className="add-btn">
              + Add Experience
            </button>
          </div>
        )}

        {/* Step 5: Optional Sections */}
        {currentStep === 5 && (
          <div className="form-step">
            <h2>Optional Information</h2>
            
            {/* Licensing */}
            <div className="optional-section">
              <h3>Professional Licenses & Certifications</h3>
              {formData.licensing.map((license, index) => (
                <div key={index} className="array-item">
                  <div className="item-header">
                    <h4>License/Certification {index + 1}</h4>
                    <button type="button" onClick={() => handleArrayRemove('licensing', index)} className="remove-btn">
                      Remove
                    </button>
                  </div>
                  <div className="form-group">
                    <label>License/Certification Name</label>
                    <input
                      type="text"
                      value={license.name}
                      onChange={(e) => handleArrayChange('licensing', index, 'name', e.target.value)}
                      placeholder="e.g., Professional Engineering License"
                    />
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      value={license.issuingOrganization}
                      onChange={(e) => handleArrayChange('licensing', index, 'issuingOrganization', e.target.value)}
                      placeholder="e.g., Engineering Institution of Zambia"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Issue Date</label>
                      <input
                        type="month"
                        value={license.issueDate}
                        onChange={(e) => handleArrayChange('licensing', index, 'issueDate', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date (if applicable)</label>
                      <input
                        type="month"
                        value={license.expiryDate}
                        onChange={(e) => handleArrayChange('licensing', index, 'expiryDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Credential ID</label>
                    <input
                      type="text"
                      value={license.credentialId}
                      onChange={(e) => handleArrayChange('licensing', index, 'credentialId', e.target.value)}
                      placeholder="Optional credential number"
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => handleArrayAdd('licensing')} className="add-btn">
                + Add License/Certification
              </button>
            </div>

            {/* Languages */}
            <div className="optional-section">
              <h3>Languages</h3>
              {formData.languages.map((language, index) => (
                <div key={index} className="array-item skill-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Language</label>
                      <input
                        type="text"
                        value={language.name}
                        onChange={(e) => handleArrayChange('languages', index, 'name', e.target.value)}
                        placeholder="e.g., English, Bemba, Nyanja"
                      />
                    </div>
                    <div className="form-group">
                      <label>Proficiency</label>
                      <select
                        value={language.proficiency}
                        onChange={(e) => handleArrayChange('languages', index, 'proficiency', e.target.value)}
                      >
                        <option>Elementary</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Native/Fluent</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => handleArrayRemove('languages', index)} className="remove-btn-inline">
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => handleArrayAdd('languages')} className="add-btn">
                + Add Language
              </button>
            </div>

            {/* Hobbies */}
            <div className="optional-section">
              <h3>Hobbies & Interests</h3>
              <div className="form-group">
                <textarea
                  value={formData.hobbies}
                  onChange={(e) => {
                    const updatedData = { ...formData, hobbies: e.target.value };
                    setFormData(updatedData);
                    onDataChange(updatedData);
                  }}
                  placeholder="e.g., Reading, Football, Community Service, Photography..."
                  rows="3"
                />
              </div>
            </div>

            {/* References */}
            <div className="optional-section">
              <h3>References</h3>
              {formData.references.map((reference, index) => (
                <div key={index} className="array-item">
                  <div className="item-header">
                    <h4>Reference {index + 1}</h4>
                    <button type="button" onClick={() => handleArrayRemove('references', index)} className="remove-btn">
                      Remove
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={reference.name}
                      onChange={(e) => handleArrayChange('references', index, 'name', e.target.value)}
                      placeholder="Full name of reference"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        value={reference.position}
                        onChange={(e) => handleArrayChange('references', index, 'position', e.target.value)}
                        placeholder="Job title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Company/Organization</label>
                      <input
                        type="text"
                        value={reference.company}
                        onChange={(e) => handleArrayChange('references', index, 'company', e.target.value)}
                        placeholder="Employer name"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={reference.phone}
                        onChange={(e) => handleArrayChange('references', index, 'phone', e.target.value)}
                        placeholder="+260 XXX XXX XXX"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={reference.email}
                        onChange={(e) => handleArrayChange('references', index, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => handleArrayAdd('references')} className="add-btn">
                + Add Reference
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="form-navigation">
        {currentStep > 1 && (
          <button type="button" onClick={prevStep} className="nav-btn prev-btn">
            ← Previous
          </button>
        )}
        {currentStep < 5 && (
          <button type="button" onClick={nextStep} className="nav-btn next-btn">
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default CVForm;
