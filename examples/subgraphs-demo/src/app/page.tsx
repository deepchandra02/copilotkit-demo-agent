"use client";
import React, { useState, useEffect } from "react";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";
import { CopilotKit, useCoAgent, useLangGraphInterrupt } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
// import { useMobileView } from "@/utils/use-mobile-view";
// import { useMobileChat } from "@/utils/use-mobile-chat";
// import { useURLParams } from "@/contexts/url-params-context";

interface SubgraphsProps {
  params: Promise<{
    integrationId: string;
  }>;
}

// Travel planning data types
interface Flight {
  airline: string;
  arrival: string;
  departure: string;
  duration: string;
  price: string;
}

interface Hotel {
  location: string;
  name: string;
  price_per_night: string;
  rating: string;
}

interface Experience {
  name: string;
  description: string;
  location: string;
  type: string;
}

interface Itinerary {
  hotel?: Hotel;
  flight?: Flight;
  experiences?: Experience[];
}

type AvailableAgents = 'flights' | 'hotels' | 'experiences' | 'supervisor'

interface TravelAgentState {
  experiences: Experience[],
  flights: Flight[],
  hotels: Hotel[],
  itinerary: Itinerary
  planning_step: string
  active_agent: AvailableAgents
}

const INITIAL_STATE: TravelAgentState = {
  itinerary: {},
  experiences: [],
  flights: [],
  hotels: [],
  planning_step: "start",
  active_agent: 'supervisor'
};

interface InterruptEvent<TAgent extends AvailableAgents> {
  message: string;
  options: TAgent extends 'flights' ? Flight[] : TAgent extends 'hotels' ? Hotel[] : never,
  recommendation: TAgent extends 'flights' ? Flight : TAgent extends 'hotels' ? Hotel : never,
  agent: TAgent
}

function InterruptHumanInTheLoop<TAgent extends AvailableAgents>({
  event,
  resolve,
}: {
  event: { value: InterruptEvent<TAgent> };
  resolve: (value: string) => void;
}) {
  const { message, options, agent, recommendation } = event.value;

  // Format agent name with emoji
  const formatAgentName = (agent: string) => {
    switch (agent) {
      case 'flights': return 'Flights Agent';
      case 'hotels': return 'Hotels Agent';
      case 'experiences': return 'Experiences Agent';
      default: return `${agent} Agent`;
    }
  };

  const handleOptionSelect = (option: any) => {
    resolve(JSON.stringify(option));
  };

  return (
    <div className="interrupt-container">
      <p>{formatAgentName(agent)}: {message}</p>

      <div className="interrupt-options">
        {options.map((opt, idx) => {
          if ('airline' in opt) {
            const isRecommended = (recommendation as Flight).airline === opt.airline;
            // Flight options
            return (
              <button
                key={idx}
                className={`option-card flight-option ${isRecommended ? 'recommended' : ''}`}
                onClick={() => handleOptionSelect(opt)}
              >
                {isRecommended && <span className="recommendation-badge">⭐ Recommended</span>}
                <div className="option-header">
                  <span className="airline-name">{opt.airline}</span>
                  <span className="price">{opt.price}</span>
                </div>
                <div className="route-info">
                  {opt.departure} → {opt.arrival}
                </div>
                <div className="duration-info">
                  {opt.duration}
                </div>
              </button>
            );
          }
          const isRecommended = (recommendation as Hotel).name === opt.name;

          // Hotel options
          return (
            <button
              key={idx}
              className={`option-card hotel-option ${isRecommended ? 'recommended' : ''}`}
              onClick={() => handleOptionSelect(opt)}
            >
              {isRecommended && <span className="recommendation-badge">⭐ Recommended</span>}
              <div className="option-header">
                <span className="hotel-name">{opt.name}</span>
                <span className="rating">{opt.rating}</span>
              </div>
              <div className="location-info">
                📍 {opt.location}
              </div>
              <div className="price-info">
                {opt.price_per_night}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  )
}

export default function Subgraphs({ params }: SubgraphsProps) {
  const { integrationId } = React.use(params);
  // const { isMobile } = useMobileView();
  // const { chatDefaultOpen } = useURLParams();
  const defaultChatHeight = 50;
  // const {
  //   isChatOpen,
  //   setChatHeight,
  //   setIsChatOpen,
  //   isDragging,
  //   chatHeight,
  //   handleDragStart
  // } = useMobileChat(defaultChatHeight);

  const chatTitle = 'Travel Planning Assistant';
  const chatDescription = 'Plan your perfect trip with AI specialists';
  const initialLabel = 'Hi! ✈️ Ready to plan an amazing trip? Try saying "Plan a trip to Paris" or "Find me flights to Tokyo"';

  return (
    <CopilotKit
      runtimeUrl={`/api/copilotkit/${integrationId}`}
      showDevConsole={false}
      agent="subgraphs"
    >
      <div className="travel-planner-container">
        <TravelPlanner />
        <CopilotSidebar
          defaultOpen={true}
          labels={{
            title: chatTitle,
            initial: initialLabel,
          }}
          clickOutsideToClose={false}
        />
      </div>
    </CopilotKit>
  );
}

function TravelPlanner() {
  const { state: agentState, nodeName } = useCoAgent<TravelAgentState>({
    name: "subgraphs",
    initialState: INITIAL_STATE,
    config: {
      streamSubgraphs: true,
    }
  });

  useLangGraphInterrupt({
    render: ({ event, resolve }) => <InterruptHumanInTheLoop event={event} resolve={resolve} />,
  });

  // Current itinerary strip
  const ItineraryStrip = () => {
    const selectedFlight = agentState?.itinerary?.flight;
    const selectedHotel = agentState?.itinerary?.hotel;
    const hasExperiences = agentState?.experiences?.length > 0;

    return (
      <div className="itinerary-strip">
        <div className="itinerary-label">Current Itinerary:</div>
        <div className="itinerary-items">
          <div className="itinerary-item">
            <span className="item-icon">📍</span>
            <span>Amsterdam → San Francisco</span>
          </div>
          {selectedFlight && (
            <div className="itinerary-item" data-testid="selected-flight">
              <span className="item-icon">✈️</span>
              <span>{selectedFlight.airline} - {selectedFlight.price}</span>
            </div>
          )}
          {selectedHotel && (
            <div className="itinerary-item" data-testid="selected-hotel">
              <span className="item-icon">🏨</span>
              <span>{selectedHotel.name}</span>
            </div>
          )}
          {hasExperiences && (
            <div className="itinerary-item">
              <span className="item-icon">🎯</span>
              <span>{agentState.experiences.length} experiences planned</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Compact agent status
  const AgentStatus = () => {
    let activeAgent = 'supervisor';
    if (nodeName?.includes('flights_agent')) {
      activeAgent = 'flights';
    }
    if (nodeName?.includes('hotels_agent')) {
      activeAgent = 'hotels';
    }
    if (nodeName?.includes('experiences_agent')) {
      activeAgent = 'experiences';
    }
    return (
      <div className="agent-status">
        <div className="status-label">Active Agent:</div>
        <div className="agent-indicators">
          <div className={`agent-indicator ${activeAgent === 'supervisor' ? 'active' : ''}`} data-testid="supervisor-indicator">
            <span>👨‍💼</span>
            <span>Supervisor</span>
          </div>
          <div className={`agent-indicator ${activeAgent === 'flights' ? 'active' : ''}`} data-testid="flights-agent-indicator">
            <span>✈️</span>
            <span>Flights</span>
          </div>
          <div className={`agent-indicator ${activeAgent === 'hotels' ? 'active' : ''}`} data-testid="hotels-agent-indicator">
            <span>🏨</span>
            <span>Hotels</span>
          </div>
          <div className={`agent-indicator ${activeAgent === 'experiences' ? 'active' : ''}`} data-testid="experiences-agent-indicator">
            <span>🎯</span>
            <span>Experiences</span>
          </div>
        </div>
      </div>
    )
  };

  // Travel details component
  const TravelDetails = () => (
    <div className="travel-details">
      <div className="details-section">
        <h4>✈️ Flight Options</h4>
        <div className="detail-items">
          {agentState?.flights?.length > 0 ? (
            agentState.flights.map((flight, index) => (
              <div key={index} className="detail-item">
                <strong>{flight.airline}:</strong>
                <span>{flight.departure} → {flight.arrival} ({flight.duration}) - {flight.price}</span>
              </div>
            ))
          ) : (
            <p className="no-activities">No flights found yet</p>
          )}
          {agentState?.itinerary?.flight && (
            <div className="detail-tips">
              <strong>Selected:</strong> {agentState.itinerary.flight.airline} - {agentState.itinerary.flight.price}
            </div>
          )}
        </div>
      </div>

      <div className="details-section">
        <h4>🏨 Hotel Options</h4>
        <div className="detail-items">
          {agentState?.hotels?.length > 0 ? (
            agentState.hotels.map((hotel, index) => (
              <div key={index} className="detail-item">
                <strong>{hotel.name}:</strong>
                <span>{hotel.location} - {hotel.price_per_night} ({hotel.rating})</span>
              </div>
            ))
          ) : (
            <p className="no-activities">No hotels found yet</p>
          )}
          {agentState?.itinerary?.hotel && (
            <div className="detail-tips">
              <strong>Selected:</strong> {agentState.itinerary.hotel.name} - {agentState.itinerary.hotel.price_per_night}
            </div>
          )}
        </div>
      </div>

      <div className="details-section">
        <h4>🎯 Experiences</h4>
        <div className="detail-items">
          {agentState?.experiences?.length > 0 ? (
            agentState.experiences.map((experience, index) => (
              <div key={index} className="activity-item">
                <div className="activity-name">{experience.name}</div>
                <div className="activity-category">{experience.type}</div>
                <div className="activity-description">{experience.description}</div>
                <div className="activity-meta">Location: {experience.location}</div>
              </div>
            ))
          ) : (
            <p className="no-activities">No experiences planned yet</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="travel-content">
      <ItineraryStrip />
      <AgentStatus />
      <TravelDetails />
    </div>
  );
}