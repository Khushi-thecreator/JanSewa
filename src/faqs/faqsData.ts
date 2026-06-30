export interface FAQItem {
  question: string;
  answer: string;
  category: 'General' | 'Process' | 'Wards & GIS' | 'Technical';
}

export const FAQS: FAQItem[] = [
  {
    category: 'General',
    question: "What is the JanSewa portal?",
    answer: "JanSewa is India's unified citizen grievance redressal system operated under the national Swachh Survekshan and Smart City guidelines. It allows citizens to directly report local municipal issues like potholes, malfunctioning streetlights, uncollected garbage, or water leaks to their regional municipal ward administrators with transparency and strict resolution timelines."
  },
  {
    category: 'General',
    question: "Do I need to create an account to file a grievance?",
    answer: "No, you do not need to register. You can file a grievance completely anonymously or just using your contact info. However, registering an account is highly recommended as it enables you to track your historical tickets on your dashboard, upvote neighboring issues, and receive live email alerts directly from your ward resident engineer."
  },
  {
    category: 'General',
    question: "How is JanSewa different from traditional helplines?",
    answer: "Traditional helplines often have no transparent tracking or firm timelines. JanSewa enforces Service Level Agreements (SLAs), provides real-time progress bars, and allows neighboring citizens to 'upvote' problems to escalate priority. Every resolution also requires photographic verification before it is closed."
  },
  {
    category: 'Process',
    question: "What is the standard resolution timeframe (SLA)?",
    answer: "Resolution times depend strictly on the priority level designated to the issue. Emergencies (such as high-voltage dangling wires or toxic water contamination) are addressed within 12-24 hours. Standard issues like non-critical streetlights or regular waste clearance are resolved within 24-48 hours. Complex road repairs or structural drainage overhauls may take up to 7 days."
  },
  {
    category: 'Process',
    question: "What happens if my complaint is not resolved in time?",
    answer: "JanSewa enforces public accountability. If a ticket exceeds its designated timeline without a valid delay explanation logged by the Ward Engineer, it is automatically escalated to the Zone Commissioner. The system flags the ward and penalizes their Swachh scorecard, which is visible publicly on the homepage leaderboard."
  },
  {
    category: 'Process',
    question: "Can I dispute a resolution if I am unsatisfied?",
    answer: "Yes, you can! When a ticket is marked 'Resolved', you can inspect the 'After' proof uploaded by the officer. If you find the resolution unsatisfactory (e.g., pothole only partially filled), you can click 'Dispute Resolution' on your status tracker to reopen the ticket, which escalates it to the ward supervisor."
  },
  {
    category: 'Wards & GIS',
    question: "How does the system know which Ward is responsible for my issue?",
    answer: "JanSewa uses advanced GIS (Geographic Information System) mapping. When you snap a photo or select your coordinates, our system maps the GPS longitude and latitude to regional ward boundaries automatically. This triggers a smart dispatch routing the grievance directly to the specific Ward Resident Engineer's dashboard."
  },
  {
    category: 'Wards & GIS',
    question: "I live in a different state, can I use JanSewa?",
    answer: "Yes! JanSewa operates nationally. It is integrated with urban local bodies (ULBs) and major municipal corporations across standard metropolitan divisions including North Zone (New Delhi), West Zone (Mumbai), South Zone (Bengaluru), East Zone (Kolkata), and Chennai Municipal zones."
  },
  {
    category: 'Wards & GIS',
    question: "What if the GPS location on my photo is slightly off?",
    answer: "Our submission wizard allows you to manually adjust the pinpoint location on the interactive ward map or enter a nearby landmark to ensure the road crew arrives at the exact site of the incident."
  },
  {
    category: 'Technical',
    question: "How do I provide feedback on a resolved ticket?",
    answer: "Once an engineer marks your issue as 'Resolved' and uploads 'After' proof, you will receive an automated email containing a feedback link. Alternatively, search your Ticket ID on our 'Track Status' page. You can rate the quality of the repair from 1 to 5 stars and add your review comments."
  },
  {
    category: 'Technical',
    question: "Can I report multiple issues in one photograph?",
    answer: "To ensure fast and clean triaging, we recommend submitting a separate ticket for each distinct issue. For example, if there is a garbage pile next to a broken street light, file one ticket under 'Sanitation' and another under 'Streetlights'. This routes them to the correct specialized crew."
  },
  {
    category: 'Technical',
    question: "How does Google Account Link work on the Dashboard?",
    answer: "By linking your Google Account via secure Single Sign-On (SSO), you authorize JanSewa to send automated real-time alerts and receipts directly to your Gmail inbox. This secure link uses secure OAuth protocols, meaning JanSewa never gains access to your passwords or personal emails."
  }
];
