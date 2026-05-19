import { useState } from 'react';

// This would typically come from an API
const mockSuspendedData = [
  {
    id: 1,
    name: "BOX-2456",
    added: "Yesterday",
    suspended: "Today",
        code: "#DL12345",
    location: "Room 202",
    floor: null,
  },
  {
    id: 2,
    name: "BOX-2456",
    added: "Yesterday",
    suspended: "Today",
        code: "#DL12345",
    location: "Room 202",
    floor: null,
  },
  {
    id: 3,
    name: "BOX-2456",
    added: "Yesterday",
    suspended: "Today",
        code: "#DL12345",
    location: "Room 202",
    floor: null,
  },
  {
    id: 4,
    name: "BOX-2456",
    code: "#GB12E3r4d",
    added: "Yesterday",
    suspended: "Today",
        code: "#DL12345",
    location: "Room 202",
    floor: null,
  },
  {
    id: 5,
    name: "BOX-2456",
    code: "#GB12E3r4d",
    added: "Yesterday",
    suspended: "Today",
        code: "#DL12345",
    location: "Room 202",
    floor: null,
  },
];

const mockRestaurants = [
  {
    id: 1,
    name: "Da Pizza Corner",
    address: "D12, Rohini West, Delhi, India, 110012",
    added: "Yesterday",
  },
  {
    id: 2,
    name: "Burger Hub",
    address: "D12, Rohini West, Delhi, India, 110012",
    added: "Yesterday",
  },
  {
    id: 3,
    name: "Sushi Place",
    address: "D12, Rohini West, Delhi, India, 110012",
    added: "Yesterday",
  },
];

export const useSuspendedGrubPacs = () => {
  const [suspendedData, setSuspendedData] = useState(mockSuspendedData);
  const [restaurants, setRestaurants] = useState(mockRestaurants);

  const activateGrubPac = (id) => {
    // Implement activation logic
    setSuspendedData(prev => prev.filter(item => item.id !== id));
  };

  const bulkActivateGrubPacs = (ids) => {
    // Implement bulk activation logic
    setSuspendedData(prev => prev.filter(item => !ids.includes(item.id)));
  };

  const reassignGrubPac = (id, restaurantId) => {
    // Implement reassignment logic
    // console.log('Reassigning GrubPac', id, 'to restaurant', restaurantId);
  };

  return {
    suspendedData,
    restaurants,
    activateGrubPac,
    bulkActivateGrubPacs,
    reassignGrubPac,
  };
}; 