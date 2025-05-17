document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('preview');
    const previewImage = document.getElementById('preview-image');
    const removeButton = document.getElementById('remove-image');
    const analyzeButton = document.getElementById('analyze-btn');
    const resultContainer = document.getElementById('result');
    const diseaseName = document.getElementById('disease-name');
    const confidence = document.getElementById('confidence');
    const errorDiv = document.getElementById('error');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    // Handle file input change
    fileInput.addEventListener('change', handleFiles);

    // Handle remove button click
    removeButton.addEventListener('click', removeImage);

    // Handle analyze button click
    analyzeButton.addEventListener('click', analyzeImage);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropArea.classList.add('dragover');
    }

    function unhighlight(e) {
        dropArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files: files } });
    }

    function handleFiles(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewContainer.style.display = 'block';
                analyzeButton.disabled = false;
            }
            reader.readAsDataURL(file);
            errorDiv.style.display = 'none';
        } else {
            showError('Please upload an image file.');
        }
    }

    function removeImage() {
        previewContainer.style.display = 'none';
        previewImage.src = '';
        fileInput.value = '';
        analyzeButton.disabled = true;
        resultContainer.style.display = 'none';
        errorDiv.style.display = 'none';
    }

    function analyzeImage() {
        const file = fileInput.files[0];
        if (!file) {
            showError('Please select an image first.');
            return;
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Show loading state
        analyzeButton.disabled = true;
        analyzeButton.textContent = 'Analyzing...';
        resultContainer.style.display = 'none';
        errorDiv.style.display = 'none';

        // Send request to server
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                // Display results
                diseaseName.textContent = data.class;
                confidence.textContent = (data.confidence * 100).toFixed(2);
                resultContainer.style.display = 'block';
            }
        })
        .catch(error => {
            showError('An error occurred while analyzing the image.');
        })
        .finally(() => {
            // Reset button state
            analyzeButton.disabled = false;
            analyzeButton.textContent = 'Analyze Image';
        });
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}); 