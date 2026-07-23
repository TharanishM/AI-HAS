
export const analyzeSymptoms = (symptomDescription) => {
  const text = (symptomDescription || '').toLowerCase();
  
  const rules = [
    {
      keywords: ['chest pain', 'angina', 'heart racing', 'palpitations', 'cardiac', 'left arm pain'],
      conditions: [
        { condition: 'Coronary Artery Disease / Angina', confidence: 85, severity: 'High' },
        { condition: 'Arrhythmia / Palpitations', confidence: 70, severity: 'High' }
      ],
      department: 'Cardiology',
      precautions: [
        'Rest immediately and sit upright.',
        'Avoid any physical exertion.',
        'Take prescribed Nitroglycerin if previously diagnosed.',
        'If pain persists for more than 5 minutes or spreads to jaw/arm, call emergency services immediately.'
      ]
    },
    {
      keywords: ['shortness of breath', 'difficulty breathing', 'wheezing', 'asthma', 'breathless'],
      conditions: [
        { condition: 'Asthma Exacerbation', confidence: 80, severity: 'High' },
        { condition: 'Acute Bronchitis', confidence: 65, severity: 'Medium' }
      ],
      department: 'Pulmonology',
      precautions: [
        'Use rescue inhaler (Albuterol) if prescribed.',
        'Sit in a comfortable, upright position.',
        'Loosen tight clothing and try slow pursed-lip breathing.',
        'Seek urgent care if breathing does not improve within 15 minutes.'
      ]
    },
    {
      keywords: ['fever', 'cough', 'chills', 'sore throat', 'runny nose', 'congestion', 'flu', 'cold'],
      conditions: [
        { condition: 'Upper Respiratory Tract Infection (Common Cold)', confidence: 90, severity: 'Low' },
        { condition: 'Influenza (Flu)', confidence: 75, severity: 'Medium' }
      ],
      department: 'General Medicine',
      precautions: [
        'Stay well hydrated with warm fluids.',
        'Get plenty of rest.',
        'Take over-the-counter antipyretics like Acetaminophen or Ibuprofen for fever.',
        'Monitor temperature regularly. Seek medical help if fever exceeds 103°F (39.4°C).'
      ]
    },
    {
      keywords: ['rash', 'itchy skin', 'hives', 'red spots', 'eczema', 'dermatitis', 'acne', 'dry skin'],
      conditions: [
        { condition: 'Contact Dermatitis / Allergic Reaction', confidence: 85, severity: 'Medium' },
        { condition: 'Eczema Flare-up', confidence: 70, severity: 'Low' }
      ],
      department: 'Dermatology',
      precautions: [
        'Avoid scratching or picking at the skin.',
        'Apply cool, damp compresses to the affected area.',
        'Use mild, fragrance-free moisturizers.',
        'Discontinue any new soaps, lotions, or cosmetics.'
      ]
    },
    {
      keywords: ['joint pain', 'stiffness', 'arthritis', 'knee pain', 'back ache', 'sprain', 'bone pain'],
      conditions: [
        { condition: 'Osteoarthritis / Rheumatoid Arthritis', confidence: 80, severity: 'Medium' },
        { condition: 'Muscle Strain or Joint Sprain', confidence: 75, severity: 'Low' }
      ],
      department: 'Orthopedics',
      precautions: [
        'Apply the R.I.C.E. protocol: Rest, Ice, Compression, Elevation.',
        'Avoid putting weight or stress on the painful joint.',
        'Use supportive braces if available.',
        'Take mild over-the-counter anti-inflammatories if safe for you.'
      ]
    },
    {
      keywords: ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'acid reflux', 'bloating', 'indigestion', 'heartburn'],
      conditions: [
        { condition: 'Gastroenteritis (Stomach Flu)', confidence: 80, severity: 'Medium' },
        { condition: 'Gastroesophageal Reflux Disease (GERD)', confidence: 75, severity: 'Low' }
      ],
      department: 'Gastroenterology',
      precautions: [
        'Drink clear fluids in small, frequent sips.',
        'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast).',
        'Avoid spicy, fatty, acidic, or caffeinated foods and beverages.',
        'Seek immediate attention for severe abdominal pain or blood in vomit/stool.'
      ]
    },
    {
      keywords: ['headache', 'migraine', 'dizziness', 'vertigo', 'numbness', 'tingling'],
      conditions: [
        { condition: 'Migraine Headache', confidence: 85, severity: 'Medium' },
        { condition: 'Tension Headache', confidence: 80, severity: 'Low' }
      ],
      department: 'Neurology',
      precautions: [
        'Rest in a dark, quiet room.',
        'Apply a cold compress to your forehead or temples.',
        'Stay hydrated and avoid screen exposure.',
        'Consult a doctor immediately if the headache is sudden and unusually severe (thunderclap).'
      ]
    },
    {
      keywords: ['blurry vision', 'eye pain', 'red eyes', 'watery eyes', 'dry eyes', 'itchy eyes'],
      conditions: [
        { condition: 'Conjunctivitis (Pink Eye)', confidence: 80, severity: 'Medium' },
        { condition: 'Dry Eye Syndrome', confidence: 75, severity: 'Low' }
      ],
      department: 'Ophthalmology',
      precautions: [
        'Avoid rubbing your eyes.',
        'Remove contact lenses immediately.',
        'Apply lubricating artificial tears.',
        'Wash hands frequently to avoid spreading potential infections.'
      ]
    },
    {
      keywords: ['frequent urination', 'burning sensation', 'kidney pain', 'urinary tract', 'uti'],
      conditions: [
        { condition: 'Urinary Tract Infection (UTI)', confidence: 85, severity: 'Medium' },
        { condition: 'Cystitis', confidence: 70, severity: 'Medium' }
      ],
      department: 'Urology',
      precautions: [
        'Drink plenty of water to help flush out bacteria.',
        'Avoid bladder irritants like coffee, alcohol, and spicy foods.',
        'Do not delay urination.',
        'Consult a healthcare provider for prescription antibiotics.'
      ]
    }
  ];

  let bestMatch = null;
  let maxMatchCount = 0;

  for (const rule of rules) {
    let matches = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }
    if (matches > maxMatchCount) {
      maxMatchCount = matches;
      bestMatch = rule;
    }
  }

  const emergencyKeywords = [
    'stroke', 'heart attack', 'unconscious', 'suicidal', 'poison', 
    'heavy bleeding', 'severe burns', 'chest pain spreads', 'difficulty swallowing',
    'cannot breathe', 'seizure', 'confusion', 'sudden weakness'
  ];

  let hasEmergency = false;
  for (const ekw of emergencyKeywords) {
    if (text.includes(ekw)) {
      hasEmergency = true;
      break;
    }
  }

  if (!bestMatch) {
    return {
      predictedConditions: [
        { condition: 'Undetermined General Health Symptom', confidence: 50, severity: hasEmergency ? 'High' : 'Medium' }
      ],
      recommendedDepartment: 'General Medicine',
      suggestedPrecautions: [
        'Monitor symptoms carefully.',
        'Record temperature and vital signs if possible.',
        'Schedule a consultation with a General Medicine physician for thorough evaluation.'
      ],
      isEmergency: hasEmergency
    };
  }

  return {
    predictedConditions: bestMatch.conditions.map(c => {
      if (hasEmergency) {
        return { ...c, severity: 'High', confidence: Math.min(c.confidence + 10, 95) };
      }
      return c;
    }),
    recommendedDepartment: bestMatch.department,
    suggestedPrecautions: bestMatch.precautions,
    isEmergency: hasEmergency || bestMatch.conditions.some(c => c.severity === 'High')
  };
};
