import React from 'react';

export const X23AboutContent = () => {
  return (
    <>
      <p className="text-gray-600 dark:text-gray-300 mb-5">
        x23.ai is dedicated to enhancing the accessibility and efficiency of Decentralized Autonomous Organizations (DAOs) by developing AI-enabled coordination tools. Their mission focuses on increasing participation and adoption of decentralized governance.
      </p>
      
      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 mt-4">Project Summary</h4>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        The company's strategy involves a three-phase approach:
      </p>
      <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 mb-4 space-y-2">
        <li>
          <span className="font-medium">Lowering Participation Barriers:</span> By introducing tools like Newsfeed and Governance bots, x23.ai aims to reduce the time required for individuals to become active contributors in DAOs from months to days or even hours.
        </li>
        <li>
          <span className="font-medium">Automating Routine Tasks:</span> Leveraging AI to handle time-consuming activities such as due diligence, allowing DAO participants to focus on more strategic initiatives.
        </li>
        <li>
          <span className="font-medium">Facilitating Human-AI Collaboration:</span> Developing frameworks that enable seamless cooperation between humans and AI agents, ensuring the sustainable operation and growth of DAOs.
        </li>
      </ul>
    </>
  );
};

export const X23TeamContent = () => {
  return (
    <p className="text-gray-600 dark:text-gray-300">
      The founder of x23.ai is David Truong, a full-stack developer with experience at Aave's Genesis team in 2020 and Coinbase in 2015, bringing a background in consumer, crypto, and AI sectors.
    </p>
  );
};

export const X23RoadmapContent = () => {
  return (
    <>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        x23.ai's roadmap aligns with their three-phase strategy:
      </p>
      
      <div className="space-y-6 mb-4">
        <div className="border-l-2 border-[color:var(--color-peach)] pl-4 py-1">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Phase One</h5>
          <p className="text-gray-600 dark:text-gray-300">
            Develop and deploy tools like Newsfeed and Governance bots to streamline information consumption and decision-making within DAOs.
          </p>
        </div>
        
        <div className="border-l-2 border-[color:var(--color-peach)] pl-4 py-1">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Phase Two</h5>
          <p className="text-gray-600 dark:text-gray-300">
            Implement AI-driven automation for tasks such as due diligence, enhancing productivity and efficiency for DAO participants.
          </p>
        </div>
        
        <div className="border-l-2 border-[color:var(--color-peach)] pl-4 py-1">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Phase Three</h5>
          <p className="text-gray-600 dark:text-gray-300">
            Establish frameworks for effective human and AI collaboration, expanding the operational capabilities of DAOs beyond traditional human labor limitations.
          </p>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300">
        This structured approach aims to transform DAO participation, making decentralized governance more accessible and effective.
      </p>
    </>
  );
};