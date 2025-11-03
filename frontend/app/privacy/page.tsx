export const metadata = {
  title: 'Privacy Policy - GrooveSzn AutoPoster',
  description: 'Privacy Policy for GrooveSzn AutoPoster',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Overview</h2>
            <p>
              Your privacy is important to us. GrooveSzn AutoPoster respects your data and privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">What We Collect</h2>
            <p>We collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>YouTube Video URLs:</strong> Video URLs you provide for processing</li>
              <li><strong>YouTube Channel IDs:</strong> Channel IDs you provide for monitoring</li>
              <li><strong>Language Preferences:</strong> Language settings for content processing</li>
              <li><strong>API Keys and Tokens:</strong> Access tokens you provide for social media platforms (TikTok, Instagram, YouTube, Facebook)</li>
              <li><strong>Usage Data:</strong> Information about how you use our service, including processing logs and status updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How We Use Information</h2>
            <p>We use the information you provide to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fetch video data from YouTube APIs</li>
              <li>Generate transcripts and captions using AI services (OpenRouter)</li>
              <li>Process and prepare short video clips</li>
              <li>Upload videos to your connected social media platforms (TikTok, Instagram, YouTube, Facebook)</li>
              <li>Monitor YouTube channels you specify</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Data Sharing</h2>
            <p>
              We do not share your personal data with third parties, except as necessary to provide our services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>YouTube API:</strong> We send video URLs and channel IDs to YouTube's official API to fetch video metadata and transcripts</li>
              <li><strong>OpenRouter AI:</strong> We send video transcripts to OpenRouter for AI-powered caption generation and viral moment detection</li>
              <li><strong>Social Media Platforms:</strong> We send video files and metadata to TikTok, Instagram, YouTube, and Facebook APIs for uploading content on your behalf</li>
            </ul>
            <p className="mt-4">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Data Storage</h2>
            <p>
              We store your API keys and access tokens securely in environment variables. Video processing is done in real-time, and we do not permanently store video files or content on our servers unless you explicitly request it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure. We use industry-standard encryption and secure API connections to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Your Choices</h2>
            <p>You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You can choose not to use our services</li>
              <li>You can disconnect your social media accounts at any time</li>
              <li>You can revoke API access tokens through the respective platform settings</li>
              <li>You can request information about what data we have stored about you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Cookies and Tracking</h2>
            <p>
              We use minimal tracking and cookies necessary for service functionality. We do not use third-party analytics or advertising trackers that collect personal information without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Children's Privacy</h2>
            <p>
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our support channels or by visiting our dashboard.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <strong>Last updated:</strong> November 2, 2025
            </p>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

