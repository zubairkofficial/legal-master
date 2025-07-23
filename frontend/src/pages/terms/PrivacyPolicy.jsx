import { Layout } from "../../components/layout/Layout";
import {
    FiInfo,
    FiDatabase,
    FiSettings,
    FiShare2,
    FiShield,
    FiUserCheck,
    FiAlertTriangle,
    FiRefreshCw,
    FiMail,
} from "react-icons/fi";

export default function PrivacyPolicy() {
    return (
        <Layout>
            <div className="px-4 py-10 max-w-4xl mx-auto font-garamond text-[14px] leading-relaxed text-gray-700" style={{ fontFamily: 'TikTok Sans, sans-serif' }}>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-10">
                        Privacy Policy
                    </h1>

                </div>
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiInfo className="text-[#BB8A28]" /> 1. Introduction
                    </h2>
                    <p>
                        Welcome to Legal Master AI, an initiative of Build Champions, a
                        501(c)(3) non-profit organization. We are dedicated to democratizing
                        access to justice by providing AI-powered legal information and
                        assistance.
                    </p>
                    <p>
                        This Privacy Policy explains how Build Champions ("we," "us," or
                        "our") collects, uses, shares, and protects information in relation
                        to our website, services, and the Legal Master AI platform
                        (collectively, the "Services"). Your privacy and the security of
                        your data are critically important to us, especially given the
                        sensitive nature of legal matters.
                    </p>
                </section>
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiDatabase className="text-[#BB8A28]" /> 2. Information We Collect
                    </h2>
                    <p>We collect information to provide and improve our Services. This includes:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>
                            <strong>A. Information You Provide Directly:</strong>
                            <ul className="list-disc pl-6 space-y-1 mt-1">
                                <li>
                                    <strong>Legal Queries and Case Information:</strong> When you use the
                                    Legal Master AI platform, you may input personal details and
                                    sensitive information related to your legal situation. This is
                                    the primary data we use to provide the Service.
                                </li>
                                <li>
                                    <strong>Contact Information:</strong> If you contact us through a
                                    form, email, or create an account, we may collect your name,
                                    email address, and any other information you provide.
                                </li>
                            </ul>
                        </li>
                        <li>
                            <strong>B. Information Collected Automatically:</strong>
                            <ul className="list-disc pl-6 space-y-1 mt-1">
                                <li>
                                    <strong>Usage Data:</strong> We automatically collect information
                                    about how you interact with our Services. This includes your IP
                                    address, browser type, device information, pages viewed, time
                                    spent on pages, and the queries you make.
                                </li>
                                <li>
                                    <strong>Cookies and Tracking Technologies:</strong> We use cookies
                                    and similar technologies to operate and analyze our Services.
                                    This helps us understand user behavior, improve our platform,
                                    and maintain session information.
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>

                {/* How We Use Information */}
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiSettings className="text-[#BB8A28]" /> 3. How We Use Your Information
                    </h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>
                            <strong>Provide, Maintain,</strong> and Improve our Services: To operate the Legal Master
                            AI platform, respond to your queries, and enhance the accuracy and
                            functionality of our AI models.
                        </li>
                        <li>
                            <strong>Anonymized Research and AI Training:</strong> We may use anonymized and aggregated
                            data from user queries to train our AI, conduct research on the justice
                            gap, and improve access to justice. We will take steps to remove
                            personally identifiable information before using it for these purposes.
                        </li>
                        <li>
                            <strong>Communicate With You:</strong> To respond to your inquiries, send
                            service-related announcements, and provide support.
                        </li>
                        <li>
                            <strong>Ensure Safety and Security:</strong> To protect against fraud, abuse, and security
                            risks.
                        </li>
                        <li>
                            <strong>Comply with Legal Obligations:</strong> To comply with applicable laws, court
                            orders, or other legal processes.
                        </li>
                    </ul>
                </section>

                {/* How We Share */}
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiShare2 className="text-[#BB8A28]" /> 4. How We Share Your Information
                    </h2>
                    <p>
                        We are committed to protecting your privacy. We do not sell your personal
                        information. We may share your information only in the following limited
                        circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>
                            <strong>With Service Providers:</strong> We may share information with third-party vendors
                            who perform services on our behalf, such as web hosting, data analysis,
                            and security. These providers are obligated to protect your information
                            and use it only for the purposes for which it was disclosed.
                        </li>
                        <li>
                            <strong>For Legal Reasons:</strong> We may disclose your information if required to do so
                            by law or in the good faith belief that such action is necessary to
                            comply with a legal obligation, protect our rights or property, or ensure
                            the safety of our users or the public.
                        </li>
                        <li>
                            <strong>Anonymized and Aggregated Data:</strong> We may share anonymized and aggregated
                            data with partners, researchers, and the public to advance our mission of
                            improving access to justice. This data will not personally identify you.
                        </li>
                        <li>
                            <strong>With Your Consent:</strong> We may share your information with third parties when
                            we have your explicit consent to do so.
                        </li>
                    </ul>
                </section>

                {/* Data Security */}
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiShield className="text-[#BB8A28]" /> 5. Data Security
                    </h2>
                    <p>
                        We implement reasonable administrative, technical, and physical safeguards
                        to protect the information we collect from loss, theft, misuse, and
                        unauthorized access or disclosure. However, no internet or email
                        transmission is ever fully secure or error-free, so you should take special
                        care in deciding what information you send to us.
                    </p>
                </section>

                {/* Privacy Rights */}
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiUserCheck className="text-[#BB8A28]" /> 6. Your Privacy Rights
                    </h2>
                    <p>
                        Depending on your jurisdiction, you may have certain rights regarding your
                        personal information, such as the right to access, correct, delete, or
                        restrict the use of your data. To make a request regarding your personal
                        information, please contact us using the information below.
                    </p>
                </section>

                {/* Children's Privacy */}
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiAlertTriangle className="text-[#BB8A28]" /> 7. Children's Privacy
                    </h2>
                    <p>
                        Our Services are not directed to individuals under the age of 13 (or 16 in
                        certain jurisdictions), and we do not knowingly collect personal
                        information from children. If we become aware that we have collected
                        personal data from a child without parental consent, we will take steps to
                        delete that information.
                    </p>
                </section>

                {/* Changes */}
                <section className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiRefreshCw className="text-[#BB8A28]" /> 8. Changes to This Privacy Policy
                    </h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of
                        any changes by posting the new policy on this page and updating the
                        "Effective Date" at the top. We encourage you to review this policy
                        periodically.
                    </p>
                </section>

                {/* Contact */}
                <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <FiMail className="text-[#BB8A28]" /> 9. Contact Us
                    </h2>
                    <p>
                        If you have any questions about this Privacy Policy or our data practices,
                        please contact us at:{" "}
                        <a
                            href="mailto:info@legalmaster.ai"
                            className="text-blue-600 hover:underline"
                        >
                            info@legalmaster.ai
                        </a>
                    </p>
                </section>
            </div>
        </Layout>
    );
}
