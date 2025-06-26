package main

import (
	"bufio"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Example represents an LLM input-output pair
type Example struct {
	ID       string `json:"id"`
	Prompt   string `json:"prompt"`
	Response string `json:"response"`
}

// Annotation represents user annotation data
type Annotation struct {
	ID        string    `json:"id" binding:"required"`
	Labels    []string  `json:"labels" binding:"required"`
	Notes     string    `json:"notes"`
	Timestamp time.Time `json:"timestamp"`
}

// AnnotationRequest represents the incoming annotation request
type AnnotationRequest struct {
	ID     string   `json:"id" binding:"required"`
	Labels []string `json:"labels" binding:"required"`
	Notes  string   `json:"notes"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status string `json:"status"`
}

func main() {
	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	
	// Create Gin router
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5439", "http://localhost:4628"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Ensure data directory exists
	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}
	// Clear examples file on startup to avoid persisted samples
	examplesPath := filepath.Join("data", "examples.jsonl")
	if err := os.WriteFile(examplesPath, []byte{}, 0644); err != nil {
		log.Printf("Failed to clear examples file: %v", err)
	}

	// Routes
	r.GET("/health", healthHandler)
	r.GET("/examples", getExamplesHandler)
	r.POST("/annotations", postAnnotationHandler)

	// Get port from environment or default to 9847
	port := os.Getenv("PORT")
	if port == "" {
		port = "9847"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// healthHandler returns the health status of the API
func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{Status: "healthy"})
}

// getExamplesHandler returns all examples from the JSONL file
func getExamplesHandler(c *gin.Context) {
	examples, err := loadExamples()
	if err != nil {
		log.Printf("Error loading examples: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load examples"})
		return
	}

	c.JSON(http.StatusOK, examples)
}

// postAnnotationHandler accepts and stores annotation data
func postAnnotationHandler(c *gin.Context) {
	var req AnnotationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Validate labels
	if len(req.Labels) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one label is required"})
		return
	}

	// Create annotation with timestamp
	annotation := Annotation{
		ID:        req.ID,
		Labels:    req.Labels,
		Notes:     req.Notes,
		Timestamp: time.Now().UTC(),
	}

	if err := saveAnnotation(annotation); err != nil {
		log.Printf("Error saving annotation: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save annotation"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Annotation saved successfully", "id": annotation.ID})
}

// loadExamples reads and parses examples from the JSONL file
func loadExamples() ([]Example, error) {
	filePath := filepath.Join("data", "examples.jsonl")
	
	// Check if file exists; if not, return empty example list
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return []Example{}, nil
	}

	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open examples file: %w", err)
	}
	defer file.Close()

	var examples []Example
	scanner := bufio.NewScanner(file)
	lineNum := 0

	for scanner.Scan() {
		lineNum++
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		var example Example
		if err := json.Unmarshal([]byte(line), &example); err != nil {
			log.Printf("Warning: Failed to parse line %d: %v", lineNum, err)
			continue
		}

		examples = append(examples, example)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading examples file: %w", err)
	}

	return examples, nil
}

// saveAnnotation appends an annotation to the CSV file
func saveAnnotation(annotation Annotation) error {
	filePath := filepath.Join("data", "annotations.csv")
	
	// Check if file exists, create with headers if not
	fileExists := true
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		fileExists = false
	}

	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return fmt.Errorf("failed to open annotations file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write headers if file is new
	if !fileExists {
		headers := []string{"id", "labels", "notes", "timestamp"}
		if err := writer.Write(headers); err != nil {
			return fmt.Errorf("failed to write CSV headers: %w", err)
		}
	}

	// Write annotation data
	labelsStr := strings.Join(annotation.Labels, ",")
	record := []string{
		annotation.ID,
		labelsStr,
		annotation.Notes,
		annotation.Timestamp.Format(time.RFC3339),
	}

	if err := writer.Write(record); err != nil {
		return fmt.Errorf("failed to write annotation: %w", err)
	}

	return nil
}

// createSampleData creates sample examples if the file doesn't exist
func createSampleData() error {
	filePath := filepath.Join("data", "examples.jsonl")
	
	sampleExamples := []Example{
		{
			ID:       "1",
			Prompt:   "What is the capital of France?",
			Response: "Paris is the capital of France. It is located in the north-central part of the country and is known for its rich history, culture, and landmarks like the Eiffel Tower.",
		},
		{
			ID:       "2",
			Prompt:   "Explain quantum computing in simple terms.",
			Response: "Quantum computing uses quantum bits (qubits) instead of regular bits. While regular bits can only be 0 or 1, qubits can be both at the same time through a property called superposition. This allows quantum computers to process many possibilities simultaneously, making them potentially much faster for certain types of problems.",
		},
		{
			ID:       "3",
			Prompt:   "How do you make a paper airplane?",
			Response: "To make a basic paper airplane: 1) Take a sheet of paper and fold it in half lengthwise, then unfold. 2) Fold the top corners into the center crease to form a triangle. 3) Fold the slanted edges into the center crease again. 4) Fold the plane in half along the original center crease. 5) Create wings by folding each side down to align with the bottom of the plane.",
		},
		{
			ID:       "4",
			Prompt:   "What are the benefits of renewable energy?",
			Response: "Renewable energy offers several benefits: environmental (reduces greenhouse gas emissions and pollution), economic (creates jobs and reduces energy costs over time), energy security (reduces dependence on fossil fuel imports), and sustainability (sources like solar and wind are inexhaustible). It also helps combat climate change and provides more stable energy prices.",
		},
		{
			ID:       "5",
			Prompt:   "Describe the water cycle.",
			Response: "The water cycle is the continuous movement of water through Earth's systems. It includes: evaporation (water turns to vapor from oceans/lakes), condensation (vapor forms clouds), precipitation (rain/snow falls), and collection (water returns to bodies of water). This cycle is powered by the sun and gravity, constantly recycling Earth's water supply.",
		},
	}

	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create examples file: %w", err)
	}
	defer file.Close()

	for _, example := range sampleExamples {
		jsonData, err := json.Marshal(example)
		if err != nil {
			return fmt.Errorf("failed to marshal example: %w", err)
		}
		
		if _, err := file.Write(jsonData); err != nil {
			return fmt.Errorf("failed to write example: %w", err)
		}
		
		if _, err := file.WriteString("\n"); err != nil {
			return fmt.Errorf("failed to write newline: %w", err)
		}
	}

	return nil
} 