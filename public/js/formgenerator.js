(function() {
    // Default form styles
    const defaultStyles = `
        /* Add default styles for the form here */
        form.customForm {
            /* Sample styles */
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: #f9f9f9;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        form.customForm input {
            margin: 5px;
        }
    `;

    // Function to generate and display the form
    function generateForm(params) {
        // Extract parameters
        const { fields, labels, styles, buttonText } = params;

        // Create form element
        const form = document.createElement('form');
        form.className = 'customForm';

        // Add fields and labels based on parameters
        fields.forEach((field, index) => {
            const labelElement = document.createElement('label');
            labelElement.innerText = labels[index];
            form.appendChild(labelElement);

            const input = document.createElement('input');
            input.name = field;
            input.placeholder = labels[index];
            form.appendChild(input);
        });

        // Add a submit button
        const submitButton = document.createElement('input');
        submitButton.type = 'submit';
        submitButton.value = buttonText || 'Submit';
        form.appendChild(submitButton);

        // Apply styles
        const styleTag = document.createElement('style');
        styleTag.innerHTML = styles || defaultStyles;
        document.head.appendChild(styleTag);

        // Append form to body
        document.body.appendChild(form);
    }

    // Expose the function to the global scope so it can be called from tracker.js
    window.generateForm = generateForm;
})();
