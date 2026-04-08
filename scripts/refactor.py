import re

with open('main.tex', 'r') as f:
    text = f.read()

# 1. Remove Organization
text = re.sub(r'\\section\{Organization of the Report\}.*?(?=\\chapterbanner|\\section)', '', text, flags=re.DOTALL)

# 2. Remove Sprint Breakdown
text = re.sub(r'\\section\{Sprint Breakdown\}.*?(?=\\section)', '', text, flags=re.DOTALL)

# 3. Remove Security Architecture
text = re.sub(r'\\section\{Security Architecture\}.*?(?=\\section|% ====)', '', text, flags=re.DOTALL)

# 4. Remove section 10.2 (Postman) if exists. Wait, there is a Postman inside a table. Let's remove the row:
text = re.sub(r'Postman\s*&\s*10\.x\s*&\s*API testing.*?\\\\', '', text)

# 5. Theoretical Chapter. If Chapter 2 is Theory, I will leave it, but let's check for any section with Theoretical.
text = re.sub(r'\\chapterbanner\{Chapter \d+:\\\\\\\\Theoretical.*?\}.*?(?=\\chapterbanner)', '', text, flags=re.DOTALL|re.IGNORECASE)
text = re.sub(r'\\section\{Theoretical.*?\}.*?(?=\\section|\\chapterbanner)', '', text, flags=re.DOTALL|re.IGNORECASE)

# 6. Update Literature Survey
new_lit = r"""\section{Literature Survey}
\noindent Agricultural waste management has been extensively studied, but the integration of digital platforms remains relatively nascent. Several papers have explored the environmental impact of crop residue burning, noting that it contributes to nearly 25\% of air pollution in Northern India during winter months. Previous attempts to manage this waste focused primarily on mechanical solutions (like Happy Seeders) or localized composting, which suffer from high capital costs and logistical challenges.

Digital platforms for waste management have been successfully deployed in urban solid waste management, but applying these to rural agriculture presents unique challenges. Research indicates that mobile-first architectures, offline capabilities, and vernacular language support are critical for adoption. Furthermore, the integration of real-time GPS tracking and AI-based image verification (e.g., using Google Genkit) represents a novel approach to ensuring transparency and accountability in the waste supply chain.

Our survey concludes that while individual technologies (IoT tracking, cloud databases, payment gateways) exist, a unified platform connecting farmers directly with recycling administrators under a Gamified and incentivized carbon-credit framework is highly necessary.
"""
text = re.sub(r'\\chapterbanner\{Chapter 3:\\\\\\\\Literature Survey\}.*?(?=\\chapterbanner\{Chapter 4)', 
              r'\\chapterbanner{Chapter 3:\\\\\\\\Literature Survey}\n\n' + new_lit.replace('\\', '\\\\') + '\n\n', 
              text, flags=re.DOTALL)

# 7. Update System Modules and Algorithm
new_modules = r"""\section{Modules of the System}
\noindent The AgriTrace system is composed of several tightly integrated modules that handle the end-to-end lifecycle of agricultural waste management. The key modules include:
\begin{enumerate}
    \item \textbf{Authentication and Role Management:} Handles secure login and registration for Farmers, Agents, and Administrators, utilizing Firebase Authentication. It securely routes users to their respective dashboards based on their roles.
    \item \textbf{Farmer Module (Waste Reporting):} Enables farmers to list their agricultural waste by category, quantity, and price. It includes a geolocation service to tag the exact coordinates of the farm and an image upload utility for visual verification.
    \item \textbf{Agent Module (Collection Logistics):} Provides collection agents with a map-based or list-based view of available waste tasks. Agents can claim tasks, navigate to the farm using optimized routes, and update the status of the waste to "In Transit".
    \item \textbf{Admin and Analytics Module:} Gives administrators a global view of the system. It tracks total waste diverted, carbon credits generated, and manages users. It utilizes Recharts for real-time visual analytics.
    \item \textbf{Payment and Incentives Module:} Integrates Razorpay to facilitate secure, instant payments from recyclers to farmers upon successful delivery of waste. It also calculates carbon credits awarded per transaction.
\end{enumerate}

\subsection{Waste Task Allocation Algorithm}
\noindent The core algorithm utilized by the platform for matching collection agents with nearby farmers is based on a localized greedy-matching heuristic combined with Haversine distance calculations.

\begin{lstlisting}[language=Python, caption={Agent-Task Matching Algorithm}]
def allocate_tasks(agent_location, available_tasks, max_radius_km):
    eligible_tasks = []
    
    # Filter and calculate distance for all OPEN tasks
    for task in available_tasks:
        if task.status == 'OPEN':
            dist = haversine(agent_location, task.location)
            if dist <= max_radius_km:
                eligible_tasks.append({
                    'task': task,
                    'distance': dist,
                    'priority_score': calculate_priority(task.quantity, dist)
                })
                
    # Sort by highest priority (combination of proximity and waste volume)
    eligible_tasks.sort(key=lambda x: x['priority_score'], reverse=True)
    
    return eligible_tasks
\end{lstlisting}
"""
text = re.sub(r'\\section\{Modules of the System\}.*?(?=\\section\{Algorithm\}|\\section\{Sprint Breakdown\}|\\section\{.*?\}|% ====)', 
              new_modules.replace('\\', '\\\\') + '\n\n', 
              text, flags=re.DOTALL)

# Remove the old Algorithm section as it's now integrated
text = re.sub(r'\\section\{Algorithm\}.*?(?=\\section)', '', text, flags=re.DOTALL)

# 8. Detailed methodology for Razorpay
new_methodology = r"""
\section{Razorpay Integration Methodology}
\noindent The payment processing architecture of AgriTrace relies on a robust integration with the Razorpay API to ensure seamless, secure, and instant financial transactions between waste purchasers (recyclers) and the farmers.

\begin{enumerate}
    \item \textbf{Order Creation:} When a collection agent successfully delivers the waste and initiates payment, the Next.js backend generates a unique Razorpay Order ID securely using server-side API routes.
    \item \textbf{Client-Side Checkout:} The Order ID is passed to the frontend component which invokes the Razorpay checkout modal. The modal handles the sensitive payment details (cards, UPI, net banking) completely isolated from the AgriTrace servers, maintaining PCI-DSS compliance.
    \item \textbf{Webhook Verification:} Upon successful payment, Razorpay triggers a secure webhook to the AgriTrace backend. The system mathematically verifies the `razorpay_signature` using the HMAC SHA256 algorithm and the merchant secret key to prevent spoofing.
    \item \textbf{State Update:} Only after signature verification is the waste listing marked as "PAID" and "DELIVERED" in the Firestore database, executing an atomic transaction to ensure data integrity.
\end{enumerate}
"""
text = re.sub(r'(\\chapterbanner\{Chapter 6:\\\\\\\\Methodology\}.*?)(?=\\chapterbanner)', 
              r'\1\n' + new_methodology.replace('\\', '\\\\') + '\n', 
              text, flags=re.DOTALL)

# 9. Change itemize to enumerate for points formatting
text = text.replace(r'\begin{itemize}', r'\begin{enumerate}')
text = text.replace(r'\end{itemize}', r'\end{enumerate}')

with open('main.tex', 'w') as f:
    f.write(text)

