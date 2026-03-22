# hoohacks
I think understand the work flow for my assignment. Generate a spec prompt for spec driven development. 
There are around 4 phases of the work flow.

The website will get user input, then it will gather data based on that input by making certain calls to zillow for 
housing pricing data with looking at average price increase/decrease 
or google maps for infrastructure around the inputted location, 
then it uses our scoring algorithm that utilizes all
that data from the pre collected dataset 
to then finally get the child development score, which 
is then finally displayed to the user with 
an ai explanation behind the score and some of logic. 
Keep in mind, that we are selected 4 
main pillars that go into the algorithm
for calculating baby score. The Data sources we used to gather the data for the algorithm is also based on the 
four pillars. The four pillar are: Education, Social Development, Safety, and Infrastructure. Some sub categories for finding
data on each pillar respectively which is given as an array is: {data on school activity of the region (zipcode), school 
accessibility programs (for disabled children), peer influence}, {data on communities in area, bully rating of rating, depression rate of
area, community values, political stance of community}, {crime trend in the area, crime registry in area, neighborhood turn over}, {hospital,libraries, parks, general accessibility}.
The gypst of how I want the algorithm to run is that it gets the constant values for the four pillars, but those constant values shift
based on the users input for age category (1 of the three categories which are newborn/toddler/child). The specifics of that algorithm might be let for your to figure out.

Phase 1: User Input Collection

Objective: Capture relevant user preferences and constraints.
    
Inputs:
    
Location (address, zip code, or city)
Budget range (low and high)
Child-related priorities (Education, Social Development, Safety, Infrastructure)
Optional:
    Number of children
    Age group( newborns , Toddlers, Children)
    Preferred school type (public/private)
    
Output(JSON):

{
  "location": {
    "type": "string",
    "description": "Address, ZIP code, or city"
  },
  "budget": {
    "min": "number",
    "max": "number"
  },
  "priorities": {
    "type": "array",
    "items": ["education", "social_development", "safety", "infrastructure"]
  },
  "children": {
    "count": "number",
    "age_groups": ["newborn", "toddler", "child"]
  },
  "school_type": {
    "type": "string",
    "enum": ["public", "private", "any"],
    "optional": true
  }
}

Phase 2: Data Aggregation Layer

Objective: Fetch and consolidate relevant external and internal data.
    
The pillars used to evaluate Score:
    Education:
        School Quality, School accessibility( for disabled and other people of need ), peer influence
    Social Development:
        Communities( religions alignment, special interest), Values( political alignment )
    Safety:
        crime trend, Quiet or Chaotic neighborhood, neighborhood turnover
    Infrastructure:
        hospitals, libraries, daycare, tutoring centers, extracurriculars, parks, 
        general accessibility, Toys stores

Below is the possible data sources to use and the API's associated with it. Completed and focus on API and sources which 
are reliable.

Data Sources:
    
Housing pricing trends (Zillow API or equivalent)
Infrastructure & amenities (Google Maps API)
USCD - (Census data API)
Police Registry (public available)
Parks
Hospitals
Public transport
Crime statistics
School ratings (GreatSchools or similar)
Census / demographic data
    
Processing:
    
Normalize all data into a unified schema
Handle missing or incomplete data
Cache frequent queries

output(JSON) (organized based on pillars):

{
    "school quality": {...},
    "communities": {...},
    "Daycares": {...},
    "hospitals": {...}
    ...
}

Phase 3: Scoring Algorithm

Objective: Compute a Child Development Score using weighted factors.
    
Core Factors (pillars):
    
Education (school quality, school accessibility, ...)
Social Development (Communities, Values, ..,)
Safety (crime trend, quiet or chaotic neighborhood, ...)
Infrastructure (Libraries, daycare)
    
Method:
    
Normalize each factor to a 0–1 scale
Apply weighted scoring (generate weights that much consumer expectations):
score = w1*education + w2*Social Development + w3*safety + w4*Infrastructure

output(JSON):
    
{
    "child_development_score": 0-100,
    "factor_breakdown": {
        "Education": X,
        "Social Development": Y,
        "safety": Z,
        ...
    }
}

Phase 4: Result Presentation + AI Explanation

Objective: Display results clearly and generate an explanation.
    
Frontend Output:
    
Final score (0–100)
    Score for each pillar (0 - 100)
Visual breakdown (charts or bars)
Key highlights (pros/cons)
    
AI Explanation:
    
Natural language explanation of:
    Why the score is high/low
    Key influencing factors
    Trade-offs
    
Example Output(JSON):

{
    "final_score": 82,
    "pillar_scores": {
        "education": 90,
        "Social Development": 75,
        "safety": 85,
        "Infrastructure": 70,
},
"highlights": {
    "pros": [
      "Highly rated schools nearby",
      "Strong access to parks and green spaces"
    ],
    "cons": [
      "Rising housing prices",
      "Moderate crime rate compared to nearby areas"
    ]
  },
  "visualization": {
    "chart_type": "grouped_bar",
    "description": "Each pillar shows user score vs average, median, and mode",
    "data": [
      {
        "category": "education",
        "values": {
          "user": 90,
          "average": 78,
          "median": 80,
          "mode": 85
        }
      }
    ]
  }
}









# Product Specification: Baby Score (Local Data Edition)

## 1. Overview
Baby Score is a web application designed to calculate a "Child Development Score" for a specific location. By taking in user constraints (location, budget , priorities, childs age) and reading from a pre-collected local dataset, the application evaluates a neighborhood across four core pillars: Education, Social Development, Safety, and Infrastructure. The final output includes a normalized score and an AI-generated explanation of the neighborhood's viability for child-rearing. #side note, I want the priorities input to be the four pillars, which will have a radio button as a scale based on their importance (from 0 - 100), this is will affect the dynamic weighting for the four pillars during the algorithm phase.

## 2. The Four Core Pillars
The scoring algorithm evaluates a location based on these predefined data categories:
* **Education:** School quality, school accessibility programs (for disabled children), peer influence.
* **Social Development:** Community alignment, bullying ratings, regional depression rates, community values, political stance.
* **Safety:** Crime trends, police registries, neighborhood turnover, general chaos vs. quietness.
* **Infrastructure:** Hospitals, libraries, parks, general accessibility, daycares, tutoring centers, toy stores.

---

## 3. Implementation Phases

### Phase 1: User Input Collection
**Objective:** Capture relevant user preferences and constraints.
The frontend will collect the following data and pass it to the backend.

**Expected Input JSON Model:**
{
  "location": {
    "type": "string",
    "description": "ZIP code"
  },
  "budget": {
    "min": "number",
    "max": "number"
  },
  "priorities": {
    "type": "array",
    "items": ["education", "social_development", "safety", "infrastructure"]
  },
  "children": {
    "count": "number",
    "age_groups": ["newborn", "toddler", "child"]
  }
}

### Phase 2: Data Aggregation Layer (Local Dataset)
**Objective:** Load and parse predefined neighborhood data based on the user's ZIP code input.
**CRITICAL RULE:** Do NOT attempt to fetch live data from Zillow, Google Maps, or Census APIs. All data must be read from a local file named `mock_data.json`. #WRONG, I want the local dataset to be predefined for 5 zipcodes, each of which are in fairfax county, it will be either your job (gemini ai) or claudes job to generate mock data for 5 different zipcodes inside Fairfax County that the user's choose from but even though the data is the same, the final score will change because the algorithm will calculate the user's priorities and age value. This is done because I will be able to make the UI for the website cleaner and easier since it will only be a map of fairfax county with 5 zipcodes added.  

**Target Data Source (`mock_data.json`):**
The system will rely on three predefined Neighborhood Archetypes: #remember this is wrong
* **10001 (The Expensive Suburb):** High budget required. Excellent schools and safety, moderate infrastructure.
* **20002 (The Urban Center):** Moderate/High budget. Excellent infrastructure (hospitals/daycares), lower safety scores.
* **30003 (The Up-and-Coming Area):** Low budget. High social development and community values, lower school ratings.

**Processing Requirements:**
1. Match the user's ZIP code to the local JSON dataset. 
2. If the user enters a ZIP code not in the database, gracefully default to `20002` to ensure the demo continues working.
3. Check the user's budget against the location's `average_home_price`.

### Phase 3: Scoring Algorithm
**Objective:** Compute a final Child Development Score (0-100) using weighted factors.

**Methodology:**
1. Normalize each of the four pillars to a 0-1 scale based on the local data.
2. Apply dynamic weighting based on the user's input for `age_groups`. #WRONG You have to apply dynamic weighting based on the user's input for age_groups AND priorities
    * *Example logic:* If the age group is "newborn," the Infrastructure weight (hospitals/daycares) and Safety weight increase. If the age group is "child," Education receives the highest weight.
3. Calculate the final score using the formula: 
   `score = (w1 * Education) + (w2 * Social_Development) + (w3 * Safety) + (w4 * Infrastructure)`

### Phase 4: Result Presentation & AI Explanation
**Objective:** Display results clearly to the user with a dynamically generated LLM explanation.

**Frontend Output Requirements:**
* Final overall score (0–100).
* Individual scores for each of the four pillars.
* Visual breakdown (charts or grouped bars comparing user score to local averages).

**AI Explanation Requirements:**
Pass the calculated data to an LLM to generate a natural language summary detailing why the score is what it is, highlighting key trade-offs based on the data.
    


