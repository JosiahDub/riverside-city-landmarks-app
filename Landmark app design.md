# Data

Each landmark has a wikidata item with a heritage designation pointing to the City of Riverside Landmark wikidata page. All can be accessed via this link: [https://www.wikidata.org/w/index.php?title=Special:WhatLinksHere/Q140544645\&limit=250](https://www.wikidata.org/w/index.php?title=Special:WhatLinksHere/Q140544645&limit=250). The wikidata items seek to hold every tiny bit of useful info: the location, inception, architecture, notable residents, etc. All info that can be loaded into OSM will be handled via script. 

# Map

We added landmarks to OSM with these tags:  
heritage=8  
heritage:operator=city\_of\_riverside\_cultural\_heritage\_board  
heritage:website=[https://riversideca.gov/cityclerk/boards-commissions/cultural-heritage-board](https://riversideca.gov/cityclerk/boards-commissions/cultural-heritage-board)  
ref:US-CA:city\_of\_riverside\_cultural\_heritage\_board=\[landmark number here\]

As stated above, we also load all relevant wikidata info. I can run a query to get all landmarks:

\`\`\`  
\[out:json\]\[timeout:360\];

// 1\. Fetch the area boundary for the City of Riverside  
area(3611051996)-\>.searchArea;

// 2\. Gather all nodes, ways, and relations containing the specific ref key  
(  
  nwr(area.searchArea)\["ref:US-CA:city\_of\_riverside\_cultural\_heritage\_board"\];  
);

// Output the results and their geometry  
out body;  
\>;  
out skel qt;

\`\`\`  
This returns all tags for every node, way, and relation tagged as a landmark.

# App

When a user opens the app, all landmark info should load. The user can filter by certain tags. For example, they want to see all the landmarks where Peter J. Weber is tagged.

* The app leans heavily on OSM, wikidata, and wikipedia. I want to stay firmly on the free to use and reuse line.  
* The user can select a landmark on the map to see the info  
  * All landmarks will have a wikidata and potentially wikipedia article tag.  
  * Some landmarks will have a wikimedia commons tags with link to image  
* The user can filter landmarks by unique tag values.  
* The user can see all tags which expand to all values loaded.  
  * For example, they can see a list that when expanded will show all architects tagged.  
  * This should respect tags with values separated by semicolons. For example, “architect=G. Stanley Wilson;Peter J. Weber” should add two unique architects  
  * Each value will have an associated wikidata and potentially a Wikipedia entry. These entries might have images to represent the architect.  
* The list of tags  
  * architect  
  * building:architecture  
    * These tags will have shortened names, like “queen\_anne”. They should somehow link to wikidata/wikipedia for the user to learn more  
    * We might need a table linking the values to wikipedia pages  
  * start\_date  
* The user can see all landmarks built between years, for example “1890-1920”  
* The user can see where they are located. The map will zoom out to include the closest landmarks to them