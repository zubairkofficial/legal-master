import { Layout } from "../../components/layout/Layout";
import {
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
  FiShield,
  FiLock,
  FiEdit,
  FiXCircle,
  FiGlobe,
  FiMail,
  FiFileText,
  FiInfo,
} from "react-icons/fi";

export default function TermsOfService() {
  return (
    <Layout>
      <div className="py-10 px-4" style={{ fontFamily: 'TikTok Sans, sans-serif' }}>
        <div className="max-w-3xl mx-auto text-[15px] leading-7 text-gray-700">
          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className="text-4xl font-bold text-gray-900 mb-3"
             style={{ fontFamily: 'TikTok Sans, sans-serif' }}
            >
              Terms of Service for Legal Master AI
            </h1>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Intro */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiBookOpen className="text-yellow-500" /> Welcome to Legal Master AI
              </h2>
              <p>
                Welcome to Legal Master AI. These Terms of Service ("Terms") govern your
                access to and use of the website, content, and the AI-powered platform
                provided by Build Champions, a 501(c)(3) non-profit organization,
                through our Legal Master AI initiative (collectively, the "Services").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms
                and our Privacy Policy. If you do not agree to these Terms, you may not
                access or use our Services.
              </p>
            </section>

            {/* Important Notice */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiAlertCircle className="text-red-500" /> IMPORTANT: No Legal Advice & No Attorney-Client Relationship
              </h2>
              <p className="font-semibold">
                THIS IS THE MOST IMPORTANT PROVISION OF THIS AGREEMENT. PLEASE READ IT CAREFULLY.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>For Informational Purposes Only:</strong> The Legal Master AI
                  platform provides automated information and software tools. It is not a
                  law firm. The information provided through our Services is for general
                  informational purposes only and should not be considered a substitute
                  for advice from a licensed attorney.
                </li>
                <li>
                  <strong>No Legal Advice:</strong> The Services are not intended to be
                  and do not constitute legal advice. The law is complex, varies by
                  jurisdiction, and is subject to interpretation by different courts.
                  You should not act or refrain from acting based on any information
                  provided by our Services without first seeking the advice of a
                  qualified attorney in the relevant jurisdiction.
                </li>
                <li>
                  <strong>No Attorney-Client Relationship:</strong> Your use of the
                  Services does not create an attorney-client relationship between you
                  and Build Champions, its employees, directors, or agents. Any
                  information you provide to us is not protected by attorney-client
                  privilege.
                </li>
              </ul>
            </section>

            {/* Description of Services */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiCheckCircle className="text-yellow-500" /> Description of Services
              </h2>
              <p>
                Legal Master AI is a tool designed to help make the law more accessible.
                It uses artificial intelligence to process user queries and provide
                information and explanations about legal concepts and processes based on
                publicly available data and legal expertise used to train the system.
              </p>
            </section>

            {/* Permitted and Prohibited Uses */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiShield className="text-yellow-500" /> Permitted and Prohibited Uses
              </h2>
              <p>
                You are granted a limited, non-exclusive, non-transferable license to
                access and use the Services for your personal, informational, and
                non-commercial use, subject to these Terms.
              </p>
              <p>You agree that you will not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Services for any illegal purpose or in violation of any local, state, national, or international law.</li>
                <li>Use the Services to provide legal advice or engage in the unauthorized practice of law.</li>
                <li>Reverse-engineer, decompile, scrape, or otherwise attempt to discover the source code or underlying AI models of the Services.</li>
                <li>Use any automated system to access the Services in a manner that sends more request messages to our servers than a human can reasonably produce in the same period.</li>
                <li>Misrepresent your identity or provide false information.</li>
                <li>Use the Services for any commercial purpose without our express written consent.</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiLock className="text-yellow-500" /> Intellectual Property
              </h2>
              <p>
                All rights, title, and interest in and to the Services, including our
                website, text, graphics, logos, software, and the AI models, are and
                will remain the exclusive property of Build Champions and its licensors.
                The Services are protected by copyright, trademark, and other laws of
                the United States and foreign countries.
              </p>
            </section>

            {/* User-Generated Content */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiEdit className="text-yellow-500" /> User-Generated Content
              </h2>
              <p>
                When you submit a query or information ("User Content") to the Services,
                you remain the owner of your User Content. However, you grant Build
                Champions a worldwide, royalty-free, perpetual, and non-exclusive license
                to use, host, store, reproduce, modify, and create derivative works from
                your User Content for the limited purpose of operating, providing, and
                improving our Services. This is further detailed in our Privacy Policy,
                including our use of anonymized data for research and AI training.
              </p>
            </section>

            {/* Disclaimers of Warranties */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiXCircle className="text-red-500" /> Disclaimers of Warranties
              </h2>
              <p>
                THE SERVICES ARE PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS, WITHOUT
                ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. BUILD CHAMPIONS
                EXPLICITLY DISCLAIMS ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT.
              </p>
              <p>
                WE DO NOT WARRANT THAT THE INFORMATION PROVIDED BY THE SERVICES WILL BE
                ACCURATE, COMPLETE, RELIABLE, CURRENT, OR ERROR-FREE. ANY RELIANCE YOU
                PLACE ON SUCH INFORMATION IS STRICTLY AT YOUR OWN RISK.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiShield className="text-yellow-500" /> Limitation of Liability
              </h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BUILD
                CHAMPIONS, ITS DIRECTORS, EMPLOYEES, AGENTS, OR VOLUNTEERS BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
                ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY,
                OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING
                FROM: (A) YOUR ACCESS TO, USE OF, OR INABILITY TO ACCESS OR USE THE
                SERVICES; (B) ANY INFORMATION OR CONTENT OBTAINED FROM THE SERVICES, AND
                ANY RELIANCE PLACED ON SUCH INFORMATION; (C) ANY UNAUTHORIZED ACCESS, USE,
                OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
              </p>
              <p>
                IN NO EVENT SHALL THE AGGREGATE LIABILITY OF BUILD CHAMPIONS EXCEED ONE
                HUNDRED U.S. DOLLARS ($100.00).
              </p>
            </section>

            {/* Indemnification */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiShield className="text-yellow-500" /> Indemnification
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless Build Champions and its
                affiliates, officers, directors, employees, and agents from and against
                any and all claims, damages, obligations, losses, liabilities, costs, or
                debt, and expenses (including but not limited to attorney's fees) arising
                from your use of and access to the Services or your violation of any term
                of these Terms.
              </p>
            </section>

            {/* Governing Law and Dispute Resolution */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiGlobe className="text-yellow-500" /> Governing Law and Dispute Resolution
              </h2>
              <p>
                These Terms shall be governed by the laws of the State of South Carolina,
                without regard to its conflict of law provisions. Any dispute arising
                from these Terms or your use of the Services will be resolved exclusively
                through final and binding arbitration in Seneca, South Carolina, rather
                than in court.
              </p>
            </section>

            {/* General Provisions */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiFileText className="text-yellow-500" /> General Provisions
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Entire Agreement:</strong> These Terms and our Privacy Policy
                  constitute the entire agreement between you and Build Champions
                  regarding the use of the Services.
                </li>
                <li>
                  <strong>Severability:</strong> If any provision of these Terms is held
                  to be invalid or unenforceable, the remaining provisions will remain in
                  full force and effect.
                </li>
                <li>
                  <strong>Changes to Terms:</strong> We reserve the right to modify these
                  Terms at any time. We will post the revised Terms on our website and
                  update the "Effective Date." Your continued use of the Services after
                  such changes constitutes your acceptance of the new Terms.
                </li>
              </ul>
            </section>

            {/* Contact Us */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 gap-2">
                <FiMail className="text-yellow-500" /> Contact Us
              </h2>
              <p>
                If you have any questions about these Terms, please contact us at:
                info@buildchampions.org
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
