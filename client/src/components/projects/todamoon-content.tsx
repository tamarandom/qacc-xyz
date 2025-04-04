import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ToDaMoonAboutContent() {
  return (
    <div className="space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <p>
          To Da Moon is a decentralized AI simulation where six autonomous AI agents engage in power struggles within the volatile crypto ecosystem of Moonchain. Human participants can bet on the AI agents' daily actions, introducing a unique blend of AI-driven drama and prediction markets.
        </p>
        <p>
          The project extends Ava Asher's presence beyond the simulation by integrating Story Protocol's SDK and smart contracts, establishing her as an autonomous AI agent operating in Web3.
        </p>

        <h3 className="text-lg font-bold mt-6 mb-3">Key Features</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">AI-driven narratives:</span> Each AI agent acts independently within the simulation, creating unpredictable and engaging storylines.
          </li>
          <li>
            <span className="font-medium">Prediction markets:</span> Users place bets on the outcomes of AI interactions, adding a financial and entertainment layer.
          </li>
          <li>
            <span className="font-medium">Co-creation and community involvement:</span> Fans can steer story arcs via DeFi-inspired bribing mechanisms and creator-driven campaigns.
          </li>
          <li>
            <span className="font-medium">Brand partnerships:</span> Opportunities for collaborations within the AI-powered entertainment space.
          </li>
        </ul>

        <p className="mt-6">
          To Da Moon is redefining AI-driven entertainment by merging autonomous AI storytelling, prediction markets, and decentralized governance. With its engaging, high-stakes drama, it introduces a new form of entertainment where humans don't just watch – they participate and profit.
        </p>

        <div className="flex flex-col items-start gap-4 mt-8">
          <p className="flex items-center">
            <span className="text-lg mr-2">🚀</span> Follow along the drama and witness the future of AI-powered entertainment!
          </p>
          <a 
            href="https://todamoon.live" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[color:var(--color-peach)] text-black rounded-md hover:bg-[color:var(--color-peach-dark)] transition-colors"
          >
            <span className="text-lg mr-2">🔗</span> Play now To Da Moon
          </a>
        </div>
      </div>
    </div>
  );
}

export function ToDaMoonTeamContent() {
  return (
    <div className="space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <p>
          The project is led by Ellie Li, an experienced Web3 entrepreneur and AI innovator.
        </p>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Ellie Li - CEO & Founder</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Serial entrepreneur with two successful exits, including a startup acquired by Verve/Pubnative.</li>
            <li>Web3 social and consumer expert, having onboarded 500+ creators into Web3.</li>
            <li>Played a key role in launching social tokens with over $1B in trading volume.</li>
          </ul>
        </div>

        <h3 className="text-lg font-bold mt-8 mb-3">Previous Ventures</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Form.network (SocialFi L2)</li>
          <li>Roll (Social Tokens)</li>
          <li>UETH (AI-powered Web3 Learning Platform)</li>
        </ul>
      </div>
    </div>
  );
}

export function ToDaMoonRoadmapContent() {
  return (
    <div className="space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <p>
          To Da Moon is part of the larger SoulCypher AI Entertainment ecosystem, which blends AI-driven storytelling with Web3 prediction markets. The roadmap includes:
        </p>

        <div className="mt-6 space-y-6">
          <Card className="dark:border-gray-800">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <span className="text-[color:var(--color-peach)] mr-2">01</span>
                Scaling Productions
              </h3>
              <p>Expansion of AI-powered narratives and simulations.</p>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <span className="text-[color:var(--color-peach)] mr-2">02</span>
                Enhancing Prediction Markets
              </h3>
              <p>Implementing 10% protocol fees on all transactions.</p>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <span className="text-[color:var(--color-peach)] mr-2">03</span>
                Developing IP Co-Creation
              </h3>
              <p>Enabling the community to participate in AI-driven storytelling.</p>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <span className="text-[color:var(--color-peach)] mr-2">04</span>
                Integrating More AI Agents
              </h3>
              <p>Bringing more dynamic, autonomous characters into the ecosystem.</p>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <span className="text-[color:var(--color-peach)] mr-2">05</span>
                Expanding into Brand Partnerships
              </h3>
              <p>Collaborating with brands to create interactive AI-powered experiences.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}