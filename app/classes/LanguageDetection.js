class LanguageDetection {
	detectLanguage() {
		return window.location.pathname.split("/")[1];
	}
}

const DetectionManager = new LanguageDetection();

export default DetectionManager;
