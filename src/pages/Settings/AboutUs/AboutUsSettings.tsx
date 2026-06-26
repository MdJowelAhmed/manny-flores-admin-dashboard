import { Info } from 'lucide-react'
import RuleSettingsPage from '../components/RuleSettingsPage'

const defaultAboutUs = `<h1>About Us</h1>
<p><em>Last updated: January 2024</em></p>

<h2>1. Who We Are</h2>
<p>Welcome to our platform. We are dedicated to delivering exceptional services and building lasting relationships with our customers and partners.</p>

<h2>2. Our Mission</h2>
<p>Our mission is to simplify operations and empower businesses through innovative solutions. We strive to:</p>
<ul>
  <li>Provide reliable and user-friendly tools</li>
  <li>Support our customers in achieving their goals</li>
  <li>Foster a culture of transparency and trust</li>
  <li>Continuously improve our products and services</li>
</ul>

<h2>3. Our Values</h2>
<p>At our core, we believe in:</p>
<ul>
  <li><strong>Integrity:</strong> Honest and ethical in everything we do</li>
  <li><strong>Innovation:</strong> Constantly evolving to meet your needs</li>
  <li><strong>Excellence:</strong> Delivering the highest quality in every interaction</li>
  <li><strong>Collaboration:</strong> Working together to achieve shared success</li>
</ul>

<h2>4. Our Story</h2>
<p>Founded with a vision to make a difference, we have grown from a small startup to a trusted partner for businesses. Our journey has been shaped by the feedback and trust of our customers.</p>

<h2>5. Our Team</h2>
<p>Our diverse team brings together expertise from various industries. We are passionate about what we do and committed to helping you succeed.</p>

<h2>6. Contact Us</h2>
<p>We would love to hear from you. Whether you have questions, feedback, or need support, our team is here to help.</p>

<hr>
<p><em>If you have any questions about us, please contact us at <a href="mailto:info@example.com">info@example.com</a></em></p>`

export default function AboutUsSettings() {
  return (
    <RuleSettingsPage
      type="ABOUT"
      icon={Info}
      translationKey="aboutUsPage"
      defaultContent={defaultAboutUs}
    />
  )
}
