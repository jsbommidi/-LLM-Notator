import { Example } from '@/types';

// Sample examples fallback if backend/API fails
export const sampleExamples: Example[] = [
  {
    id: '1',
    prompt: 'What is the capital of France?',
    response: 'Paris is the capital of France. It is located in the north-central part of the country and is known for its rich history, culture, and landmarks like the Eiffel Tower.',
  },
  {
    id: '2',
    prompt: 'Explain quantum computing in simple terms.',
    response: 'Quantum computing uses quantum bits (qubits) instead of regular bits. While regular bits can only be 0 or 1, qubits can be both at the same time through a property called superposition. This allows quantum computers to process many possibilities simultaneously, making them potentially much faster for certain types of problems.',
  },
  {
    id: '3',
    prompt: 'How do you make a paper airplane?',
    response: 'To make a basic paper airplane: 1) Take a sheet of paper and fold it in half lengthwise, then unfold. 2) Fold the top corners into the center crease to form a triangle. 3) Fold the slanted edges into the center crease again. 4) Fold the plane in half along the original center crease. 5) Create wings by folding each side down to align with the bottom of the plane.',
  },
  {
    id: '4',
    prompt: 'What are the benefits of renewable energy?',
    response: 'Renewable energy offers several benefits: environmental (reduces greenhouse gas emissions and pollution), economic (creates jobs and reduces energy costs over time), energy security (reduces dependence on fossil fuel imports), and sustainability (sources like solar and wind are inexhaustible). It also helps combat climate change and provides more stable energy prices.',
  },
  {
    id: '5',
    prompt: 'Describe the water cycle.',
    response: 'The water cycle is the continuous movement of water through Earth\'s systems. It includes: evaporation (water turns to vapor from oceans/lakes), condensation (vapor forms clouds), precipitation (rain/snow falls), and collection (water returns to bodies of water). This cycle is powered by the sun and gravity, constantly recycling Earth\'s water supply.',
  },
];
