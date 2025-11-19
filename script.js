// Function to save user preferences to localStorage
function savePreferences() {
  const preferences = {
    timeOfDay: document.getElementById('timeOfDay').value,
    focusArea: document.getElementById('focusArea').value,
    timeAvailable: document.getElementById('timeAvailable').value,
    energyLevel: document.getElementById('energyLevel').value,
    preferredActivities: Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(checkbox => checkbox.value)
  };
  localStorage.setItem('routinePreferences', JSON.stringify(preferences));
}

// Function to load user preferences from localStorage
function loadPreferences() {
  const savedPreferences = JSON.parse(localStorage.getItem('routinePreferences'));
  if (savedPreferences) {
    document.getElementById('timeOfDay').value = savedPreferences.timeOfDay || '';
    document.getElementById('focusArea').value = savedPreferences.focusArea || '';
    document.getElementById('timeAvailable').value = savedPreferences.timeAvailable || '';
    document.getElementById('energyLevel').value = savedPreferences.energyLevel || '';

    // Restore preferred activities
    const activityCheckboxes = document.querySelectorAll('input[name="activities"]');
    activityCheckboxes.forEach(checkbox => {
      checkbox.checked = savedPreferences.preferredActivities.includes(checkbox.value);
    });
  }
}

// Add an event listener to the form that runs when the form is submitted
document.getElementById('routineForm').addEventListener('submit', async (e) => {
  // Prevent the form from refreshing the page
  e.preventDefault();
  
  // Extract values from the form inputs
  const timeOfDay = document.getElementById('timeOfDay').value;
  const focusArea = document.getElementById('focusArea').value;
  const timeAvailable = document.getElementById('timeAvailable').value;
  const energyLevel = document.getElementById('energyLevel').value;

  // Get all selected preferred activities
  const activityCheckboxes = document.querySelectorAll('input[name="activities"]:checked');
  const preferredActivities = Array.from(activityCheckboxes).map(checkbox => checkbox.value);

  // Update the user message in the API call
  const userMessage = `Plan a personalized daily routine based on the following parameters:\n- Time of Day: ${timeOfDay}\n- Focus Area: ${focusArea}\n- Time Available: ${timeAvailable} minutes\n- Energy Level: ${energyLevel}\n- Preferred Activities: ${preferredActivities.join(', ')}`;

  // Find the submit button and update its appearance to show loading state
  const button = document.querySelector('button[type="submit"]');
  button.textContent = 'Generating...';
  button.disabled = true;
  
  try {    
    // Make the API call to OpenAI's chat completions endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [      
          { role: 'system', content: `You are a helpful assistant that creates quick, focused daily routines. Always keep routines short, realistic, and tailored to the user's preferences.` },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_completion_tokens: 500
      })
    });
    
    // Convert API response to JSON and get the generated routine
    const data = await response.json();
    const routine = data.choices[0].message.content;
    
    // Show the result section and display the routine
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('routineOutput').textContent = routine;
    
  } catch (error) {
    // If anything goes wrong, log the error and show user-friendly message
    console.error('Error:', error);
    document.getElementById('routineOutput').textContent = 'Sorry, there was an error generating your routine. Please try again.';
  } finally {
    // Always reset the button back to its original state using innerHTML to render the icon
    button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate My Routine';
    button.disabled = false;
  }
});

// Add event listener to save preferences when the form is submitted
document.getElementById('routineForm').addEventListener('submit', savePreferences);

// Load preferences when the page loads
window.addEventListener('DOMContentLoaded', loadPreferences);
