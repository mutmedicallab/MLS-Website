import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";
import { getCurrentPeriodId } from "../utils/periodId";

const WEEK_ID = getCurrentPeriodId(2);
const ROUND_SECONDS = 60;
const QUESTIONS_PER_ROUND = 15;
const SEEN_KEY = "mutmlsa_speed_seen";

// Each entry: [term, correct answer, wrong 1, wrong 2, wrong 3]
// Options are shuffled every time a round starts, so position never gives the answer away.
const TERM_POOL = [
  // ---------- HAEMATOLOGY ----------
  ["Howell-Jolly bodies", "Nuclear DNA remnants inside red cells", "RNA remnants in reticulocytes", "Denatured haemoglobin inclusions", "Iron-laden mitochondria"],
  ["Heinz bodies", "Denatured haemoglobin inclusions in red cells", "Nuclear remnants in red cells", "Aggregated ribosomes in lead poisoning", "Malaria parasites"],
  ["Basophilic stippling", "Aggregated ribosomes in red cells, e.g. lead poisoning", "Nuclear DNA fragments", "Denatured haemoglobin", "Platelet clumps"],
  ["Auer rods", "Needle-like inclusions in myeloblasts", "Inclusions in CLL lymphocytes", "Parasites inside red cells", "Crystals in plasma cells"],
  ["Smudge cells", "Fragile lymphocytes typical of CLL", "Ruptured platelets in ITP", "Lysed red cells in HDN", "Degenerating neutrophils in sepsis"],
  ["Rouleaux", "Red cells stacked like coins", "Clumped platelets", "Sickled red cells", "Fragmented red cells"],
  ["Target cells (codocytes)", "Red cells with a dark centre, seen in thalassaemia", "Spiky red cells", "Sickle-shaped red cells", "Red cells with nuclear remnants"],
  ["Schistocytes", "Fragmented red cells seen in MAHA and DIC", "Teardrop cells of myelofibrosis", "Spherical cells lacking central pallor", "Cells with Cabot rings"],
  ["Spherocytes", "Red cells lacking central pallor", "Red cells with a bull's-eye", "Fragmented red cells", "Elongated oval red cells"],
  ["Dacrocytes", "Teardrop-shaped red cells", "Burr cells", "Bite cells", "Helmet cells"],
  ["Left shift", "Increased immature neutrophils (bands) in blood", "Increased lymphocytes", "Hypersegmented neutrophils", "Increased eosinophils"],
  ["Hypersegmented neutrophils", "Typical of megaloblastic anaemia", "Typical of bacterial infection", "Typical of iron deficiency", "Typical of aplastic anaemia"],
  ["Pelger-Huët anomaly", "Bilobed neutrophil nuclei with normal function", "Giant granules in neutrophils", "Excess nuclear segments", "Absent neutrophil granules"],
  ["Chediak-Higashi syndrome", "Giant lysosomal granules in leukocytes", "Bilobed neutrophils", "Döhle-like bodies with giant platelets", "Absent neutrophils"],
  ["Döhle bodies", "Blue cytoplasmic RNA remnants in neutrophils", "Red inclusions in red cells", "Nuclear fragments in lymphocytes", "Crystalline rods in blasts"],
  ["Toxic granulation", "Prominent dark granules in neutrophils during infection", "Giant granules in all white cells", "Auer rods", "Aggregated platelets"],
  ["MCV", "Average volume of a red cell", "Haemoglobin per cell", "Haemoglobin concentration in packed cells", "Variation in red cell size"],
  ["MCHC", "Average haemoglobin concentration in red cells", "Average red cell volume", "Haemoglobin mass per cell", "Red cell distribution width"],
  ["RDW", "Variation in red cell size (anisocytosis)", "Variation in platelet number", "Average cell volume", "Haemoglobin per cell"],
  ["Philadelphia chromosome", "t(9;22) BCR-ABL, seen in CML", "t(15;17), seen in APL", "t(8;14), seen in Burkitt lymphoma", "t(14;18), seen in follicular lymphoma"],
  ["t(15;17)", "Acute promyelocytic leukaemia", "Chronic myeloid leukaemia", "Burkitt lymphoma", "Follicular lymphoma"],
  ["Reed-Sternberg cell", "Hallmark of Hodgkin lymphoma", "Hallmark of Burkitt lymphoma", "Hallmark of CLL", "Hallmark of multiple myeloma"],
  ["Bence Jones protein", "Free light chains in urine, seen in myeloma", "Albumin in nephrotic syndrome", "Haemoglobin in haemolysis", "Myoglobin after muscle injury"],
  ["Sickle haemoglobin (HbS)", "Glutamic acid replaced by valine at β6", "Glutamic acid replaced by lysine at β6", "Absent β-chains", "Excess δ-chains"],
  ["Haemoglobin C", "Glutamic acid replaced by lysine at β6", "Glutamic acid replaced by valine at β6", "Absent α-chains", "Excess γ-chains"],
  ["Sodium metabisulphite test", "Reducing agent that induces sickling of HbS", "Oxidising agent that causes Heinz bodies", "Stain for reticulocytes", "Anticoagulant for coagulation tests"],
  ["G6PD deficiency", "Enzyme defect causing oxidative haemolysis", "Defect in globin chain synthesis", "Membrane protein defect", "Autoimmune red cell destruction"],
  ["Hereditary spherocytosis", "Defect in membrane proteins such as spectrin or ankyrin", "Defect in a glycolytic enzyme", "Defect in globin chains", "Autoantibody coating of red cells"],
  ["Osmotic fragility test", "Tests red cell resistance to hypotonic saline", "Tests clot retraction", "Tests platelet aggregation", "Identifies haemoglobin variants"],
  ["Direct antiglobulin test", "Detects antibody or complement already on red cells", "Detects free antibody in serum", "Detects clotting factors", "Determines the ABO group"],
  ["Indirect antiglobulin test", "Detects free antibody in serum", "Detects antibody coating the patient's red cells", "Measures haemoglobin", "Counts reticulocytes"],
  ["Stain for reticulocytes", "New methylene blue or brilliant cresyl blue", "Perls' Prussian blue", "Sudan black B", "Leishman"],
  ["Perls' Prussian blue", "Stains haemosiderin iron", "Stains reticulocyte RNA", "Stains glycogen", "Stains lipids"],
  ["Sudan Black B", "Stains lipid in myeloid cells", "Stains iron", "Stains glycogen", "Stains acid phosphatase"],
  ["PAS stain", "Detects glycogen and carbohydrates", "Detects iron", "Detects lipids", "Detects reticulocyte RNA"],
  ["Myeloperoxidase", "Marker of myeloid blasts", "Marker of lymphoid blasts", "Marker of plasma cells", "Marker of megakaryocytes"],
  ["TdT", "Marker of immature lymphoid blasts, as in ALL", "Marker of myeloid blasts", "Marker of mature plasma cells", "Marker of platelets"],
  ["Prothrombin time", "Tests the extrinsic and common pathways", "Tests the intrinsic pathway", "Tests platelet function", "Tests fibrinolysis"],
  ["aPTT", "Tests the intrinsic and common pathways", "Tests the extrinsic pathway", "Measures bleeding time", "Counts platelets"],
  ["INR", "Standardises PT for warfarin monitoring", "Standardises aPTT for heparin", "Standardises platelet aggregation", "Measures fibrinogen"],
  ["Warfarin", "Inhibits vitamin K-dependent clotting factors", "Enhances antithrombin", "Dissolves fibrin clots", "Blocks platelet ADP receptors"],
  ["Heparin", "Enhances antithrombin activity", "Inhibits vitamin K recycling", "Dissolves clots", "Activates platelets"],
  ["Vitamin K-dependent factors", "II, VII, IX and X", "I, V, VIII and XIII", "III, IV, XI and XII", "V, VIII, XI and XII"],
  ["Haemophilia A", "Factor VIII deficiency", "Factor IX deficiency", "Factor XI deficiency", "von Willebrand factor deficiency"],
  ["Haemophilia B", "Factor IX deficiency", "Factor VIII deficiency", "Factor VII deficiency", "Factor XIII deficiency"],
  ["von Willebrand disease", "Defective platelet adhesion due to vWF deficiency", "Defective platelet aggregation due to GPIIb/IIIa", "Factor IX deficiency", "Antithrombin deficiency"],
  ["Glanzmann thrombasthenia", "GPIIb/IIIa defect causing failed platelet aggregation", "GPIb defect causing failed adhesion", "vWF deficiency", "Storage pool granule defect"],
  ["Bernard-Soulier syndrome", "GPIb defect with giant platelets", "GPIIb/IIIa defect", "Factor VIII deficiency", "Absent fibrinogen"],
  ["D-dimer", "Fibrin degradation product showing clot breakdown", "Marker of platelet activation", "Marker of vitamin K status", "Marker of antithrombin levels"],
  ["DIC", "Widespread clotting that consumes factors and platelets", "Isolated platelet destruction", "Isolated factor VIII lack", "Excess platelet production"],
  ["Immune thrombocytopenia", "Antibody-mediated destruction of platelets", "Failure of megakaryocyte development", "Hereditary giant platelets", "Platelet overproduction"],
  ["Polycythaemia vera", "Clonal rise in red cell mass, often with JAK2 V617F", "Reactive rise due to hypoxia", "Fall in plasma volume from dehydration", "Rise caused by raised erythropoietin"],
  ["JAK2 V617F", "Mutation common in PV, ET and primary myelofibrosis", "Translocation of CML", "Fusion gene of APL", "Mutation of hereditary spherocytosis"],
  ["Megaloblastic anaemia", "Impaired DNA synthesis from B12 or folate lack", "Defective haem synthesis from iron lack", "Defective globin synthesis", "Premature red cell destruction"],
  ["Pernicious anaemia", "B12 deficiency from lack of intrinsic factor", "Folate deficiency from diet", "Iron deficiency from blood loss", "Haemolysis from G6PD deficiency"],
  ["Intrinsic factor", "Made by gastric parietal cells for B12 absorption", "Made by the liver for iron transport", "Made by the kidney for red cell production", "Made by the pancreas for fat digestion"],
  ["Sideroblastic anaemia", "Ring sideroblasts from defective haem synthesis", "Spherocytes from membrane defects", "Target cells from globin defects", "Megaloblasts from B12 lack"],
  ["Anaemia of chronic disease", "High hepcidin, low serum iron, normal or high ferritin", "Low ferritin with raised TIBC", "Raised ferritin with raised TIBC", "Low hepcidin with low ferritin"],
  ["Ferritin", "Iron storage protein, low in iron deficiency", "Iron transport protein in plasma", "Enzyme of haem synthesis", "Marker of B12 status"],
  ["Transferrin", "Plasma iron transport protein", "Tissue iron storage protein", "Hormone regulating iron absorption", "Precursor of haem"],
  ["TIBC in iron deficiency", "Increased", "Decreased", "Unchanged", "Undetectable"],
  ["Hepcidin", "Hormone that blocks iron release by ferroportin", "Hormone that stimulates red cell production", "Enzyme of haem synthesis", "Transport protein for iron"],
  ["Erythropoietin", "Kidney hormone stimulating red cell production", "Liver hormone stimulating platelet production", "Marrow hormone stimulating neutrophils", "Spleen hormone destroying old red cells"],
  ["Thrombopoietin", "Liver-made hormone driving platelet production", "Kidney hormone driving red cell production", "Hormone that destroys platelets", "Clotting factor"],
  ["Leukaemoid reaction", "Reactive leukocytosis with left shift and high LAP score", "Clonal leukocytosis with low LAP score", "Pancytopenia with blasts", "Isolated eosinophilia"],
  ["Aplastic anaemia", "Pancytopenia with a hypocellular marrow", "Pancytopenia with a hypercellular marrow", "Isolated raised platelets", "Macrocytosis with circulating blasts"],
  ["Myelodysplastic syndrome", "Clonal marrow disorder with ineffective haematopoiesis", "Reactive marrow response to infection", "Inherited platelet defect", "Autoimmune destruction of red cells"],
  ["Infectious mononucleosis", "EBV infection with atypical lymphocytes", "Blast crisis of leukaemia", "Neutrophilia with toxic granulation", "Eosinophilia from helminths"],
  ["Monospot test", "Detects heterophile antibodies in glandular fever", "Detects HBsAg", "Detects Salmonella antibodies", "Detects rheumatoid factor"],
  ["Eosinophilia", "Raised in parasitic infections and allergy", "Raised in bacterial sepsis", "Raised in aplastic anaemia", "Raised with steroid therapy"],
  ["Neutropenia", "Absolute neutrophil count below 1.5 × 10⁹/L", "Absolute neutrophil count above 7.5 × 10⁹/L", "Platelet count below 150 × 10⁹/L", "Haemoglobin below 12 g/dL"],
  ["Causes of a raised ESR", "Increased fibrinogen and immunoglobulins", "Sickle cells in the sample", "Polycythaemia", "Microcytosis"],
  ["Reticulocyte count", "Measures marrow red cell output", "Measures red cell lifespan", "Measures iron stores", "Measures platelet function"],
  ["Cabot rings", "Ring-shaped remnants of the mitotic spindle in red cells", "Rings of ribosomes in lead poisoning", "Ring sideroblasts", "Rings of denatured haemoglobin"],
  ["Pappenheimer bodies", "Iron granules in red cells staining with Perls'", "Nuclear fragments in red cells", "Denatured haemoglobin", "Platelet inclusions"],
  ["Burr cells (echinocytes)", "Red cells with regular short projections", "Red cells with irregular spikes (acanthocytes)", "Red cells with a bite removed", "Red cells shaped like teardrops"],
  ["Hairy cell leukaemia", "B-cell leukaemia with TRAP-positive cells and BRAF V600E", "T-cell leukaemia with HTLV-1", "Myeloid leukaemia with Auer rods", "Plasma cell leukaemia"],
  ["Multiple myeloma", "Clonal plasma cell malignancy with paraprotein", "Clonal T-cell malignancy", "Reactive plasmacytosis", "Platelet disorder"],
  ["Blast crisis", "Terminal phase of CML with over 20% blasts", "Acute transfusion reaction", "Febrile neutropenia", "Hyperviscosity in myeloma"],

  // ---------- CLINICAL CHEMISTRY ----------
  ["ALT", "Liver enzyme raised in hepatocellular injury", "Enzyme specific to bile duct obstruction", "Cardiac muscle enzyme", "Pancreatic digestive enzyme"],
  ["AST", "Enzyme found in liver, heart and muscle", "Specific to bile ducts", "Specific to the pancreas", "Specific to bone"],
  ["ALP", "Raised in cholestasis and bone disease", "Raised only in hepatitis", "Raised only in myocardial infarction", "Raised only in pancreatitis"],
  ["GGT", "Sensitive marker of cholestasis and alcohol use", "Specific marker of bone disease", "Cardiac marker", "Marker of muscle damage"],
  ["Lipase", "More specific than amylase for acute pancreatitis", "Marker of myocardial infarction", "Marker of cholestasis", "Marker of bone turnover"],
  ["CK-MB", "Cardiac isoenzyme raised in myocardial infarction", "Brain isoenzyme raised in stroke", "Liver isoenzyme raised in cholestasis", "Bone isoenzyme raised in fractures"],
  ["Troponin I and T", "Most specific markers of myocardial injury", "Markers of cholestasis", "Markers of kidney tubular damage", "Markers of thyroid function"],
  ["LDH", "Enzyme raised in haemolysis and tissue damage", "Enzyme specific to the liver", "Enzyme specific to bone", "Enzyme specific to the pancreas"],
  ["Haptoglobin", "Binds free haemoglobin; falls in intravascular haemolysis", "Rises in intravascular haemolysis", "Carries iron in plasma", "Stores iron in tissues"],
  ["Conjugated bilirubin", "Water-soluble form raised in obstructive jaundice", "Water-insoluble form raised in haemolysis", "Form bound to albumin in blood only", "Form never found in urine"],
  ["Unconjugated hyperbilirubinaemia", "Typical of haemolysis and Gilbert syndrome", "Typical of bile duct obstruction", "Typical of Dubin-Johnson syndrome", "Typical of primary biliary cholangitis"],
  ["Urine urobilinogen in obstructive jaundice", "Reduced or absent", "Markedly increased", "Unchanged", "Present only in stool"],
  ["Pre-hepatic jaundice", "Excess bilirubin production, e.g. haemolysis", "Blocked bile flow", "Hepatocyte damage", "Failure of bile secretion into the gut"],
  ["Creatinine clearance", "Estimates glomerular filtration rate", "Measures tubular secretion only", "Measures urine concentrating ability", "Measures protein loss"],
  ["Cystatin C", "GFR marker not affected by muscle mass", "Cardiac injury marker", "Liver synthetic marker", "Pancreatic enzyme"],
  ["HbA1c", "Reflects average glucose over 8–12 weeks", "Reflects glucose over the last 24 hours", "Reflects glucose over one week", "Reflects glucose over one year"],
  ["Fructosamine", "Reflects glycaemic control over about 2–3 weeks", "Reflects control over 3 months", "Reflects control over one day", "Reflects control over a year"],
  ["Ketone bodies", "Acetoacetate, β-hydroxybutyrate and acetone", "Pyruvate, lactate and alanine", "Urea, creatinine and uric acid", "Bilirubin, biliverdin and urobilin"],
  ["Nitroprusside reaction", "Detects acetoacetate in urine", "Detects glucose in urine", "Detects bilirubin in urine", "Detects protein in urine"],
  ["Anion gap", "Na⁺ − (Cl⁻ + HCO₃⁻)", "Cl⁻ − (Na⁺ + HCO₃⁻)", "Ca²⁺ − (Mg²⁺ + K⁺)", "HCO₃⁻ − Cl⁻"],
  ["Metabolic acidosis", "Low pH with low bicarbonate", "Low pH with high pCO₂", "High pH with low pCO₂", "High pH with high bicarbonate"],
  ["Respiratory alkalosis", "High pH with low pCO₂", "Low pH with high pCO₂", "High pH with high bicarbonate", "Low pH with low bicarbonate"],
  ["Pseudohyperkalaemia", "Falsely raised potassium from haemolysis or delayed separation", "True potassium excess from renal failure", "Potassium raised by insulin therapy", "Potassium lowered by sample clotting"],
  ["Osmolality", "Number of solute particles per kilogram of water", "Mass of solute per litre of solution", "Acidity of a solution", "Viscosity of a solution"],
  ["Friedewald equation", "Estimates LDL from total cholesterol, HDL and triglycerides", "Estimates GFR from creatinine", "Estimates the anion gap", "Estimates osmolality"],
  ["Lipaemic sample", "Milky plasma from triglycerides that can interfere with assays", "Pink plasma from haemolysis", "Yellow-brown plasma from bilirubin", "Clotted sample"],
  ["Beer-Lambert law", "Absorbance is proportional to concentration and path length", "Absorbance falls as concentration rises", "Light emitted is proportional to temperature", "Voltage is proportional to ion activity"],
  ["Flame photometry", "Measures Na and K by light emitted from excited atoms", "Measures proteins by absorbance", "Measures pH with a glass electrode", "Measures osmolality by freezing point"],
  ["Ion-selective electrode", "Measures ion activity through a potential difference", "Measures light absorbed by a coloured product", "Measures fluorescence of an antibody label", "Measures gas by chromatography"],
  ["Corrected calcium", "Adjusts total calcium for albumin level", "Adjusts calcium for haemolysis", "Adjusts calcium for sample age", "Adjusts calcium for tourniquet time"],
  ["Parathyroid hormone", "Raises serum calcium", "Lowers serum calcium", "Raises serum phosphate", "Lowers serum magnesium"],
  ["Low fT4 with high TSH", "Primary hypothyroidism", "Graves disease", "Secondary hypothyroidism", "Subclinical hyperthyroidism"],
  ["Cortisol diurnal rhythm", "Highest in the early morning", "Highest at midnight", "Constant throughout the day", "Highest in the late afternoon"],
  ["AFP", "Tumour marker for hepatocellular carcinoma", "Tumour marker for prostate cancer", "Tumour marker for colorectal cancer", "Tumour marker for ovarian cancer"],
  ["PSA", "Tumour marker for prostate disease", "Tumour marker for liver cancer", "Tumour marker for bowel cancer", "Tumour marker for pancreatic cancer"],
  ["CA-125", "Marker used in ovarian cancer monitoring", "Marker of hepatocellular carcinoma", "Marker of prostate cancer", "Marker of colon cancer"],
  ["β-hCG", "Marker of pregnancy and trophoblastic tumours", "Marker of thyroid cancer", "Marker of liver cancer", "Marker of bone turnover"],
  ["C-reactive protein", "Acute-phase protein made by the liver", "Antibody made by plasma cells", "Complement component", "Clotting factor"],
  ["Uric acid", "End-product of purine metabolism, raised in gout", "End-product of protein metabolism", "End-product of haem breakdown", "End-product of creatine"],
  ["Albumin", "Main plasma protein maintaining oncotic pressure", "Main iron transport protein", "Main clotting protein", "Main antibody class"],
  ["Nephrotic syndrome", "Heavy proteinuria with low albumin and oedema", "Haematuria with red cell casts", "Glucose in urine only", "Raised urea with normal creatinine"],
  ["Microalbuminuria", "Early marker of diabetic kidney damage", "Marker of liver failure", "Marker of urinary infection", "Marker of heart failure"],
  ["Acute kidney injury", "Rapid rise in creatinine or fall in urine output", "Slow decline over more than 3 months", "Isolated raised bilirubin", "Isolated proteinuria"],

  // ---------- QUALITY & STATISTICS ----------
  ["Levey-Jennings chart", "Plots QC values against mean and SD limits over time", "Plots patient results against age", "Plots reagent cost over time", "Plots turnaround time by shift"],
  ["Westgard 1-3s rule", "One control beyond ±3 SD, suggesting random error", "Two controls beyond ±2 SD, suggesting systematic error", "Four controls beyond 1 SD on one side", "Ten consecutive controls on one side of the mean"],
  ["Westgard 10x rule", "Ten consecutive controls on one side of the mean, suggesting systematic error", "One control beyond 3 SD", "Range between controls exceeds 4 SD", "Two controls beyond 2 SD in opposite directions"],
  ["QC shift", "Abrupt change in the mean of control values", "Gradual drift in one direction", "Random scatter around the mean", "Loss of all signal"],
  ["QC trend", "Gradual progressive drift of control values in one direction", "Abrupt change in the mean", "Random scatter", "Single outlier"],
  ["Precision", "Reproducibility of repeated measurements", "Closeness to the true value", "Lowest amount detectable", "Ability to measure only the analyte"],
  ["Accuracy", "Closeness of a result to the true value", "Reproducibility of repeated results", "Lowest amount detectable", "Range of values reported"],
  ["Diagnostic sensitivity", "Proportion of diseased people correctly identified", "Proportion of healthy people correctly identified", "Proportion of positive results that are true", "Proportion of negative results that are true"],
  ["Diagnostic specificity", "Proportion of healthy people correctly identified", "Proportion of diseased people correctly identified", "Proportion of positive results that are true", "Overall proportion correctly classified"],
  ["Positive predictive value", "Proportion of positive results that are true positives", "Proportion of diseased correctly identified", "Proportion of healthy correctly identified", "Proportion of negatives that are true"],
  ["Limit of detection", "Lowest amount reliably distinguished from a blank", "Highest amount measurable", "Lowest amount quantified with set precision", "Average of replicate controls"],
  ["Delta check", "Comparing a result with the patient's previous result", "Comparing two instruments", "Comparing reagent lots", "Comparing staff competence"],
  ["Coefficient of variation", "SD divided by mean, multiplied by 100", "Mean divided by SD", "Highest minus lowest value", "Middle value of a data set"],
  ["Reference interval", "Usually the central 95% of a healthy population", "The full range seen in a healthy population", "The range seen in sick patients", "The range of the control material"],
  ["Calibration vs QC", "Calibration sets the instrument against known standards; QC checks it is performing correctly", "They mean the same thing", "QC adjusts the instrument; calibration only monitors", "Calibration is done only once at purchase"],
  ["ISO 15189", "International standard for medical laboratory quality and competence", "Standard for blood bank labelling", "Standard for lab building design only", "Standard for reagent manufacture"],
  ["Internal quality control", "Daily testing of control material to monitor performance", "Sample exchange with other laboratories", "Review of staff leave", "Audit of reagent expiry only"],
  ["Proficiency testing", "Blind samples from an external body to compare labs", "Daily internal control runs", "Staff interviews", "Equipment servicing"],
  ["Turnaround time", "Time from sample receipt or request to result reporting", "Time taken to centrifuge", "Time for an analyser warm-up", "Time a sample is stored"],
  ["Critical value", "Result requiring immediate notification to the clinician", "Result outside the reference range by any amount", "Result of an internal control", "Result from a rejected sample"],

  // ---------- MICROBIOLOGY ----------
  ["Catalase test", "Staphylococci positive, streptococci negative", "Streptococci positive, staphylococci negative", "Distinguishes E. coli from Klebsiella", "Identifies pneumococci"],
  ["Coagulase test", "Separates S. aureus (positive) from coagulase-negative staphylococci", "Separates Streptococcus groups", "Identifies Enterobacteriaceae", "Detects beta-lactamase"],
  ["Oxidase test", "Positive for Pseudomonas and Neisseria", "Positive for E. coli", "Positive for Klebsiella", "Positive for Salmonella"],
  ["Optochin sensitivity", "Identifies Streptococcus pneumoniae", "Identifies Streptococcus pyogenes", "Identifies Staphylococcus aureus", "Identifies Enterococcus"],
  ["Bacitracin sensitivity", "Presumptive identification of Group A streptococci", "Identification of S. pneumoniae", "Identification of S. aureus", "Identification of Group B streptococci"],
  ["CAMP test", "Identifies Group B streptococcus (S. agalactiae)", "Identifies Group A streptococcus", "Identifies pneumococci", "Identifies enterococci"],
  ["Beta haemolysis", "Complete clearing of blood around colonies", "Green discolouration around colonies", "No change around colonies", "Black colonies"],
  ["Alpha haemolysis", "Partial haemolysis with green discolouration", "Complete clearing", "No haemolysis", "Double zone of haemolysis"],
  ["Acid-fast bacilli", "Resist acid-alcohol decolourisation because of mycolic acid", "Lose crystal violet easily", "Lack a cell wall", "Stain only with Giemsa"],
  ["Ziehl-Neelsen stain", "Stains acid-fast bacilli red on a blue background", "Stains Gram-negative rods pink", "Stains spores green", "Stains capsules clear against dark"],
  ["Auramine-phenol", "Fluorescent stain for acid-fast bacilli", "Stain for spores", "Stain for capsules", "Stain for fungi only"],
  ["Löwenstein-Jensen medium", "Egg-based medium for Mycobacterium tuberculosis", "Selective medium for Salmonella", "Medium for Vibrio cholerae", "Medium for Neisseria"],
  ["MacConkey agar", "Selective and differential for Gram-negative enteric bacteria", "Enriched medium for fastidious organisms", "Medium for Vibrio cholerae only", "Medium for fungi only"],
  ["XLD agar", "Selective for Salmonella and Shigella", "Selective for Vibrio cholerae", "Selective for Neisseria", "Selective for Staphylococcus"],
  ["TCBS agar", "Selective for Vibrio species, V. cholerae forming yellow colonies", "Selective for Salmonella", "Selective for Shigella", "Selective for fungi"],
  ["Chocolate agar", "Enriched medium supporting Haemophilus and Neisseria", "Selective medium for Salmonella", "Medium for fungi", "Medium for Mycobacteria"],
  ["Satellitism", "Haemophilus growing near Staphylococcus colonies on blood agar", "Staphylococcus growing near Pseudomonas", "Colonies forming swarming growth", "Colonies growing inside agar only"],
  ["Cary-Blair medium", "Transport medium for stool pathogens such as Vibrio", "Enrichment medium for Neisseria", "Medium for Mycobacteria", "Medium for anaerobes only"],
  ["Widal test", "Detects antibodies to Salmonella Typhi O and H antigens", "Detects antibodies to Brucella", "Detects HBsAg", "Detects malaria antigen"],
  ["TSI acid butt, alkaline slant", "Glucose fermentation only", "Fermentation of lactose and sucrose", "No fermentation", "Urea hydrolysis"],
  ["Urease-positive rapidly", "Proteus species", "Escherichia coli", "Salmonella Typhi", "Shigella species"],
  ["Indole-positive organism", "Escherichia coli", "Klebsiella pneumoniae", "Enterobacter cloacae", "Salmonella Typhi"],
  ["Citrate-positive organism", "Klebsiella pneumoniae", "Escherichia coli", "Shigella sonnei", "Salmonella Typhi"],
  ["Kirby-Bauer method", "Disk diffusion susceptibility testing read by zone diameter", "Broth dilution to find MBC", "Gram staining of colonies", "Anaerobic culture technique"],
  ["MIC", "Lowest antibiotic concentration that inhibits visible growth", "Lowest concentration that kills 99.9%", "Highest tolerated dose", "Zone diameter in mm"],
  ["ESBL", "Enzymes that hydrolyse third-generation cephalosporins", "Enzymes that destroy rifampicin", "Enzymes that modify ribosomes", "Efflux pumps for tetracycline"],
  ["MRSA", "S. aureus carrying mecA and PBP2a", "S. aureus lacking coagulase", "Streptococcus resistant to penicillin", "Enterococcus resistant to vancomycin"],
  ["Mueller-Hinton agar", "Standard medium for disk diffusion testing", "Selective medium for Salmonella", "Medium for Mycobacteria", "Medium for fungi"],
  ["0.5 McFarland standard", "Turbidity standard for adjusting bacterial suspensions", "Standard for adjusting pH", "Standard for measuring colony count", "Standard for incubation temperature"],
  ["Autoclave conditions", "121 °C at 15 psi for 15–20 minutes", "100 °C for 30 minutes", "160 °C for 2 hours", "72 °C for 15 seconds"],
  ["Hot air oven conditions", "160 °C for 2 hours", "121 °C for 15 minutes", "100 °C for 5 minutes", "56 °C for 30 minutes"],
  ["Geobacillus stearothermophilus", "Spore indicator used to test autoclaves", "Organism used to test hot air ovens", "Bacterium causing food poisoning", "Quality control for Gram stain"],
  ["Class II biosafety cabinet", "Protects user, sample and environment using HEPA filtration", "Protects only the user", "Provides no airflow", "Used only for chemicals"],
  ["Vibrio cholerae", "Comma-shaped bacterium causing rice-water stools", "Spiral organism causing syphilis", "Gram-positive coccus in clusters", "Acid-fast rod"],
  ["Albert's stain", "Shows metachromatic granules of Corynebacterium diphtheriae", "Stains acid-fast bacilli", "Stains capsules", "Stains spores"],
  ["Neisseria gonorrhoeae", "Gram-negative intracellular diplococci in pus cells", "Gram-positive cocci in chains", "Acid-fast rods", "Spiral bacteria"],
  ["Treponema pallidum", "Spirochaete causing syphilis, seen by dark-field microscopy", "Gram-negative rod causing typhoid", "Gram-positive rod causing diphtheria", "Acid-fast rod causing leprosy"],
  ["Mycoplasma", "Bacterium with no cell wall", "Acid-fast bacterium", "Bacterium with a capsule", "Spore-forming rod"],
  ["India ink preparation", "Negative stain showing the capsule of Cryptococcus", "Stain for acid-fast bacilli", "Stain for spores", "Stain for iron"],
  ["Germ tube test", "Positive for Candida albicans", "Positive for Cryptococcus", "Positive for Aspergillus", "Positive for dermatophytes"],
  ["KOH preparation", "Dissolves keratin to reveal fungal elements", "Stains bacteria", "Preserves stool parasites", "Detects antibodies"],
  ["Dermatophytes", "Fungi infecting skin, hair and nails", "Fungi causing meningitis", "Fungi causing pneumonia only", "Fungi found only in blood"],
  ["Clostridium tetani", "Spore-forming anaerobe causing tetanus", "Gram-negative diplococcus", "Acid-fast rod", "Facultative anaerobic coccus"],
  ["Helicobacter pylori", "Curved Gram-negative rod that is urease-positive", "Gram-positive coccus", "Acid-fast rod", "Spore-forming anaerobe"],
  ["Bordetella pertussis", "Causes whooping cough; grown on Bordet-Gengou agar", "Causes diphtheria", "Causes typhoid", "Causes cholera"],
  ["Brucella", "Small Gram-negative coccobacilli causing undulant fever", "Gram-positive rods causing anthrax", "Spirochaetes", "Acid-fast rods"],
  ["Enterococcus faecalis", "Grows in 6.5% NaCl and bile-aesculin positive", "Optochin sensitive", "Catalase positive", "Coagulase positive"],

  // ---------- PARASITOLOGY ----------
  ["Plasmodium falciparum", "Multiple ring forms in red cells and banana-shaped gametocytes", "Enlarged red cells with Schüffner's dots", "Band forms in the red cell", "Rosette-shaped schizonts only"],
  ["Schüffner's dots", "Seen in red cells infected with P. vivax and P. ovale", "Seen in P. falciparum", "Seen in P. malariae only", "Seen in Babesia"],
  ["Maurer's clefts", "Seen in red cells infected with P. falciparum", "Seen in P. vivax", "Seen in P. malariae", "Seen in Trypanosoma"],
  ["Plasmodium malariae", "Band-form trophozoites and a 72-hour cycle", "48-hour cycle with enlarged red cells", "Banana-shaped gametocytes", "24-hour cycle only"],
  ["Plasmodium knowlesi", "24-hour cycle, mimics P. malariae under the microscope", "72-hour cycle", "Banana-shaped gametocytes", "Dormant liver stages"],
  ["Thick blood film", "Concentrates parasites for detection", "Used for species identification only", "Used for cell counting only", "Used for Gram staining"],
  ["Thin blood film", "Used for species identification and parasite percentage", "Used only to detect low parasitaemia", "Used for blood grouping", "Used for ESR"],
  ["Field's stain", "Rapid stain for malaria thick films", "Stain for acid-fast bacilli", "Stain for spores", "Stain for iron"],
  ["Giemsa pH for malaria", "7.2", "5.0", "9.0", "3.5"],
  ["Anopheles", "Female mosquito that transmits malaria", "Mosquito that transmits dengue", "Fly that transmits sleeping sickness", "Fly that transmits river blindness"],
  ["Hypnozoites", "Dormant liver stages of P. vivax and P. ovale", "Gametocytes in blood", "Sporozoites in the mosquito", "Merozoites in red cells"],
  ["HRP-2 antigen", "Rapid test target specific to P. falciparum", "Rapid test target for P. vivax only", "Marker of HIV infection", "Marker of typhoid"],
  ["Ascaris lumbricoides", "Large roundworm with mamillated eggs", "Pinworm with flat-sided eggs", "Whipworm with barrel-shaped eggs", "Hookworm with thin-shelled eggs"],
  ["Trichuris trichiura", "Whipworm with barrel-shaped eggs and polar plugs", "Roundworm with mamillated eggs", "Pinworm with flat-sided eggs", "Beef tapeworm"],
  ["Enterobius vermicularis", "Pinworm diagnosed by cellophane tape swab", "Whipworm diagnosed by stool", "Hookworm diagnosed by blood film", "Roundworm diagnosed by sputum"],
  ["Hookworm eggs", "Thin-shelled with several cells inside", "Barrel-shaped with plugs", "Mamillated thick shell", "Spined shell"],
  ["Strongyloides stercoralis", "Rhabditiform larvae in stool and autoinfection", "Eggs with lateral spines", "Barrel-shaped eggs", "Proglottids in stool"],
  ["Taenia saginata", "Beef tapeworm with more than 12 uterine branches", "Pork tapeworm with 7–13 branches", "Fish tapeworm", "Dwarf tapeworm"],
  ["Taenia solium", "Pork tapeworm that can cause neurocysticercosis", "Beef tapeworm", "Fish tapeworm", "Dog tapeworm"],
  ["Schistosoma mansoni", "Lateral-spined eggs found in stool", "Terminal-spined eggs in urine", "Barrel-shaped eggs in stool", "Larvae in stool"],
  ["Schistosoma haematobium", "Terminal-spined eggs found in urine", "Lateral-spined eggs in stool", "Round spineless eggs in sputum", "Larvae in blood"],
  ["Entamoeba histolytica", "Trophozoites containing ingested red cells", "Pear-shaped trophozoites with two nuclei", "Acid-fast oocysts", "Banana-shaped gametocytes"],
  ["Giardia lamblia", "Pear-shaped trophozoites with two nuclei", "Trophozoites with ingested red cells", "Acid-fast oocysts", "Rice-water stools"],
  ["Cryptosporidium", "Acid-fast oocysts seen with modified ZN", "Pear-shaped flagellate", "Amoeba with ingested red cells", "Barrel-shaped eggs"],
  ["Trypanosoma brucei", "Cause of sleeping sickness, spread by tsetse fly", "Cause of Chagas disease by kissing bugs", "Cause of kala-azar by sandflies", "Cause of malaria by mosquitoes"],
  ["Leishmania donovani", "Kala-azar, with LD bodies in macrophages", "Sleeping sickness", "Chagas disease", "River blindness"],
  ["Wuchereria bancrofti", "Lymphatic filariasis with sheathed microfilariae in night blood", "River blindness with skin microfilariae", "Eye worm", "Guinea worm"],
  ["Loa loa", "Eye worm spread by Chrysops flies, microfilariae in daytime blood", "Night-biting filaria", "Skin worm causing river blindness", "Guinea worm"],
  ["Onchocerca volvulus", "River blindness diagnosed with skin snips", "Eye worm", "Elephantiasis worm", "Sleeping sickness parasite"],
  ["Formol-ether concentration", "Technique to concentrate parasite eggs and cysts from stool", "Stain for malaria", "Stain for acid-fast bacilli", "Test for occult blood"],
  ["Kato-Katz technique", "Quantitative thick smear for helminth eggs in stool", "Stain for blood parasites", "Antibody test for malaria", "Culture of amoebae"],
  ["Toxoplasma gondii", "Protozoan whose definitive host is the cat", "Amoeba from contaminated water", "Flagellate causing diarrhoea", "Worm from undercooked beef"],
  ["Trichomonas vaginalis", "Motile flagellated protozoan causing vaginitis", "Yeast causing thrush", "Gram-positive coccus", "Spirochaete"],

  // ---------- IMMUNOLOGY, SEROLOGY & VIROLOGY ----------
  ["IgM", "First antibody in a primary response; pentamer", "Only class crossing the placenta", "Main mucosal antibody", "Antibody of allergy"],
  ["IgG", "Only antibody class crossing the placenta", "First antibody in primary response", "Antibody of mucosal secretions", "Antibody of allergy"],
  ["IgA", "Main antibody in mucosal secretions", "First antibody produced", "Crosses the placenta", "Binds mast cells in allergy"],
  ["IgE", "Antibody of allergy and parasitic infection", "Antibody of mucosal secretions", "Crosses the placenta", "First antibody produced"],
  ["Type I hypersensitivity", "IgE-mediated immediate reaction such as anaphylaxis", "Antibody-mediated cytotoxic reaction", "Immune complex reaction", "T-cell delayed reaction"],
  ["Type II hypersensitivity", "Antibody-mediated cytotoxicity, e.g. transfusion reaction", "IgE-mediated anaphylaxis", "Immune complex disease", "Delayed T-cell reaction"],
  ["Type III hypersensitivity", "Immune complex deposition, e.g. SLE", "IgE-mediated anaphylaxis", "Cytotoxic antibody reaction", "Delayed T-cell reaction"],
  ["Type IV hypersensitivity", "Delayed T-cell mediated, e.g. Mantoux test", "IgE-mediated anaphylaxis", "Immune complex disease", "Cytotoxic antibody reaction"],
  ["ELISA", "Enzyme-linked assay detecting antigen or antibody by colour change", "Gel separation of DNA", "Staining of tissue sections", "Culture of bacteria"],
  ["Western blot", "Detects specific proteins by antibody binding on a membrane", "Detects specific DNA sequences", "Detects specific RNA sequences", "Counts cells by size"],
  ["CD4 count", "Monitors immune status in HIV infection", "Monitors hepatitis B", "Monitors kidney function", "Monitors malaria"],
  ["p24 antigen", "HIV core protein detected in fourth-generation assays", "HIV envelope glycoprotein", "Hepatitis B surface antigen", "Marker of EBV"],
  ["PCR", "Amplifies DNA through repeated heating and cooling cycles", "Separates proteins by size", "Stains tissue", "Counts blood cells"],
  ["Viral load", "Copies of viral RNA per mL, used to monitor ART", "Number of CD4 cells", "Level of antibody", "Level of C-reactive protein"],
  ["HBsAg", "Surface antigen, marker of current hepatitis B infection", "Marker of vaccine immunity only", "Marker of past infection only", "Marker of hepatitis A"],
  ["Anti-HBs", "Immunity after vaccination or recovery", "Marker of acute infection", "Marker of high infectivity", "Marker of chronic carriage"],
  ["Anti-HBc IgM", "Marker of acute hepatitis B", "Marker of vaccination immunity", "Marker of hepatitis A", "Marker of hepatitis C"],
  ["HBeAg", "Marker of high replication and infectivity in hepatitis B", "Marker of vaccine immunity", "Marker of hepatitis A", "Marker of recovery"],
  ["ANA", "Autoantibodies to nuclear components, as in SLE", "Antibodies to HIV", "Antibodies to hepatitis B", "Antibodies to Salmonella"],
  ["Anti-dsDNA", "Highly specific for SLE", "Specific for rheumatoid arthritis", "Specific for coeliac disease", "Specific for HIV"],
  ["Rheumatoid factor", "IgM antibody against the Fc portion of IgG", "IgG antibody against DNA", "Antibody against citrullinated peptide", "Antibody against mitochondria"],
  ["Anti-CCP", "Highly specific antibody for rheumatoid arthritis", "Specific for SLE", "Specific for coeliac disease", "Specific for hepatitis"],
  ["Prozone effect", "Excess antibody causing a false negative agglutination", "Excess antigen causing a false positive", "Low temperature causing agglutination", "Contamination causing haemolysis"],
  ["VDRL test", "Non-treponemal flocculation test for syphilis", "Confirmatory treponemal test", "Test for HIV", "Test for hepatitis B"],
  ["TPHA", "Treponemal test confirming syphilis", "Non-treponemal screening test", "Test for HIV", "Test for typhoid"],
  ["Mantoux test", "Tuberculin skin test reflecting delayed hypersensitivity", "Blood test for TB antibodies", "Sputum culture for TB", "Chest X-ray finding"],
  ["Xpert MTB/RIF", "Detects TB DNA and rifampicin resistance", "Stains acid-fast bacilli", "Cultures TB on egg medium", "Detects TB antibodies"],
  ["Flow cytometry", "Counts and characterises cells using lasers and labelled antibodies", "Stains tissue sections", "Separates proteins by size", "Cultures bacteria"],
  ["Complement C3 in immune complex disease", "Often low because it is consumed", "Often raised", "Unchanged", "Absent"],
  ["Hepatitis A", "Faecal-oral virus with an IgM marker in acute infection", "Blood-borne DNA virus", "Blood-borne RNA virus", "Needs hepatitis B to replicate"],
  ["Hepatitis C", "RNA virus often becoming chronic, detected by anti-HCV and PCR", "DNA virus spread faecal-orally", "Vaccine-preventable virus", "Needs hepatitis A to replicate"],
  ["Hepatitis D", "Defective virus that needs hepatitis B to replicate", "Faecal-oral virus", "Virus preventable by vaccine alone", "DNA virus that is self-sufficient"],
  ["Negri bodies", "Inclusions found in rabies-infected neurons", "Inclusions in CMV-infected cells", "Inclusions in HIV-infected cells", "Inclusions in malaria-infected cells"],
  ["Owl-eye inclusions", "Characteristic of cytomegalovirus", "Characteristic of rabies", "Characteristic of measles", "Characteristic of HIV"],

  // ---------- BLOOD BANKING ----------
  ["Landsteiner's rule", "People have antibodies against ABO antigens they lack", "People have antibodies to all ABO antigens", "ABO antibodies are present only after transfusion", "Rh antibodies are naturally occurring"],
  ["Bombay phenotype", "Lacks H antigen and appears group O with anti-H", "Lacks Rh antigens", "Lacks Duffy antigens", "Has weak A antigens"],
  ["Universal red cell donor", "Group O negative", "Group AB positive", "Group A negative", "Group B positive"],
  ["Universal plasma donor", "Group AB", "Group O", "Group A", "Group B"],
  ["Anti-D immunoglobulin", "Prevents Rh sensitisation in D-negative mothers", "Treats ABO incompatibility", "Treats haemophilia", "Replaces clotting factors"],
  ["Haemolytic disease of the newborn", "Maternal IgG attacking fetal red cells", "Fetal antibody attacking the mother", "IgM crossing the placenta", "Bacterial infection of the newborn"],
  ["Kleihauer-Betke test", "Quantifies fetal cells in maternal blood by acid elution", "Identifies the ABO group", "Detects antibodies in serum", "Counts platelets"],
  ["Weak D", "Reduced D antigen expression detected by the indirect antiglobulin test", "Absent D antigen", "Strong D antigen", "Anti-D in the plasma"],
  ["Antibody screen", "Detects unexpected antibodies using reagent red cells", "Identifies the donor's group", "Counts white cells", "Measures haemoglobin"],
  ["Acute haemolytic transfusion reaction", "Often caused by ABO incompatibility with intravascular haemolysis", "Mild fever from cytokines", "Delayed reaction 2 weeks later", "Allergic urticaria"],
  ["TRALI", "Acute lung injury within 6 hours of transfusion", "Fluid overload from rapid transfusion", "Delayed haemolysis", "Iron overload"],
  ["Cryoprecipitate", "Rich in fibrinogen, factor VIII, vWF and factor XIII", "Rich in platelets", "Rich in red cells", "Rich in albumin"],
  ["Fresh frozen plasma", "Contains all clotting factors", "Contains platelets", "Contains red cells", "Contains only albumin"],
  ["Platelet storage", "20–24 °C with continuous agitation", "2–6 °C without agitation", "−18 °C", "37 °C"],
  ["Red cell storage", "2–6 °C", "20–24 °C with agitation", "−30 °C", "37 °C"],
  ["Cold agglutinin", "IgM antibody reacting best at about 4 °C", "IgG antibody reacting at 37 °C", "IgE antibody", "IgA antibody in secretions"],
  ["Duffy-negative phenotype", "Resistance to P. vivax invasion", "Resistance to P. falciparum", "Resistance to HIV", "Resistance to typhoid"],
  ["Kell antigen", "Highly immunogenic red cell antigen", "Antigen present on platelets only", "Antigen that is part of ABO", "Weakly immunogenic antigen"],
  ["Rh antigen D", "Most immunogenic Rh antigen", "Least immunogenic Rh antigen", "Part of the ABO system", "Found only on platelets"],

  // ---------- HISTOLOGY & CYTOLOGY ----------
  ["10% neutral buffered formalin", "Most common routine tissue fixative", "Stain for nuclei", "Decalcifying agent", "Clearing agent"],
  ["Decalcification", "Removal of calcium from bone before sectioning", "Removal of lipid", "Removal of water", "Removal of pigment"],
  ["Haematoxylin", "Stains nuclei blue-purple", "Stains cytoplasm pink", "Stains collagen green", "Stains fat red"],
  ["Eosin", "Stains cytoplasm and collagen pink", "Stains nuclei blue", "Stains fat red", "Stains iron blue"],
  ["Papanicolaou stain", "Standard stain for cervical cytology", "Stain for acid-fast bacilli", "Stain for iron", "Stain for amyloid"],
  ["Tissue processing order", "Fixation, dehydration, clearing, infiltration, embedding", "Embedding, fixation, clearing, staining", "Staining, fixation, embedding", "Clearing, fixation, dehydration, staining"],
  ["Xylene", "Common clearing agent", "Common fixative", "Common stain", "Common decalcifier"],
  ["Microtome", "Instrument that cuts thin tissue sections", "Instrument that spins tubes", "Instrument that counts cells", "Instrument that sterilises"],
  ["Frozen section", "Rapid intra-operative diagnosis using frozen tissue", "Sections cut from paraffin only", "Section used for culture", "Section used for blood film"],
  ["Immunohistochemistry", "Detects tissue antigens using labelled antibodies", "Stains tissue with haematoxylin only", "Cultures tissue", "Fixes tissue"],
  ["Masson's trichrome", "Stains collagen blue or green", "Stains iron", "Stains amyloid", "Stains lipid"],
  ["Congo red", "Stains amyloid, giving apple-green birefringence under polarised light", "Stains iron", "Stains collagen", "Stains lipid"],
  ["Von Kossa stain", "Demonstrates calcium deposits", "Demonstrates iron", "Demonstrates amyloid", "Demonstrates glycogen"],
  ["Reticulin stain", "Silver impregnation showing reticular fibres", "Demonstrates calcium", "Demonstrates iron", "Demonstrates amyloid"],
  ["Oil Red O", "Stains fat; needs frozen sections", "Stains iron", "Stains collagen", "Stains amyloid"],
  ["Koilocytes", "Cells with perinuclear halos indicating HPV infection", "Cells with Auer rods", "Cells with Reed-Sternberg features", "Cells with ingested red cells"],
  ["Metaplasia", "Reversible replacement of one mature cell type by another", "Irreversible uncontrolled growth", "Increase in cell number", "Increase in cell size"],
  ["Dysplasia", "Disordered cell growth with abnormal maturation", "Replacement of one adult cell type by another", "Cell death", "Increase in organ size"],
  ["Anaplasia", "Loss of cell differentiation, a feature of malignancy", "Increase in cell size", "Increase in cell number", "Reversible adaptation"],
  ["Hyperplasia", "Increase in the number of cells", "Increase in the size of cells", "Decrease in cell size", "Replacement of cell type"],
  ["Hypertrophy", "Increase in the size of cells", "Increase in the number of cells", "Decrease in cell number", "Loss of differentiation"],
  ["Apoptosis", "Programmed cell death without inflammation", "Cell death from injury with inflammation", "Cell division", "Cell differentiation"],
  ["Coagulative necrosis", "Typical of ischaemic infarcts such as in the heart", "Typical of brain infarcts", "Typical of tuberculosis", "Typical of pancreatitis"],
  ["Caseous necrosis", "Cheese-like necrosis typical of tuberculosis", "Typical of heart infarction", "Typical of brain infarction", "Typical of fat necrosis"],
  ["Fine needle aspiration cytology", "Sampling cells through a thin needle for diagnosis", "Full excision of a lump", "Blood culture technique", "Bone marrow trephine"],
  ["Barr body", "Inactivated X chromosome in female cells", "Y chromosome in male cells", "Viral inclusion", "Nuclear fragment"],

  // ---------- PRE-ANALYTICS & SAFETY ----------
  ["Order of draw", "Blood culture, citrate, serum, heparin, EDTA, fluoride", "EDTA, citrate, serum, heparin, fluoride", "Serum, EDTA, heparin, citrate, culture", "Fluoride, EDTA, heparin, serum, citrate"],
  ["Grey-top tube", "Sodium fluoride and potassium oxalate for glucose", "EDTA for haematology", "Citrate for coagulation", "Heparin for chemistry"],
  ["Green-top tube", "Contains heparin", "Contains EDTA", "Contains citrate", "Contains fluoride"],
  ["Prolonged tourniquet", "Causes haemoconcentration and falsely raised analytes", "Dilutes the sample", "Lowers potassium", "Prevents clotting"],
  ["Citrate tube ratio", "Nine parts blood to one part citrate", "One part blood to nine parts citrate", "Equal parts blood and citrate", "Five parts blood to one part citrate"],
  ["Glucose in a standing sample", "Falls through glycolysis by red cells", "Rises over time", "Stays constant", "Converts to ketones"],
  ["Refrigerating whole blood before separation", "Raises potassium by blocking the sodium pump", "Lowers potassium", "Raises sodium", "Prevents all haemolysis"],
  ["Light-sensitive analyte", "Bilirubin", "Sodium", "Creatinine", "Urea"],
  ["Needlestick injury first aid", "Wash with soap and water and report for PEP", "Squeeze hard and suck the wound", "Apply bleach to the wound", "Ignore if no blood visible"],
  ["Blood spill disinfection", "Cover with 0.5% hypochlorite (5000 ppm) and wait", "Wipe with water only", "Pour 70% ethanol only", "Cover with dry paper and discard"],
  ["Biosafety level 2", "Work with moderate-risk agents such as HBV and Salmonella", "Work with airborne lethal agents", "Work with no known hazards", "Work with only chemical hazards"],
  ["Sharps container", "Puncture-resistant bin for needles and blades", "Autoclave bag for all waste", "Bin for glass only", "Bin for chemicals"],
  ["Hand hygiene moment", "Before and after patient contact and after glove removal", "Only before lunch", "Only after leaving the lab", "Only when visibly dirty"],
  ["Specimen rejection reason", "Unlabelled or mislabelled tube", "Slightly late arrival of routine serum", "Different tube brand", "Fasting patient"],
  ["Two patient identifiers", "Full name and a second unique identifier such as date of birth", "Ward and bed only", "Doctor's name", "Time of collection only"],
  ["Haemolysis index", "Estimates free haemoglobin in serum or plasma", "Estimates lipids in serum", "Estimates bilirubin in serum", "Estimates clot formation"],
  ["Order of capillary collection", "EDTA first, then others, to prevent platelet clumping", "Serum first", "Citrate first", "No order matters"],
  ["Angle for venipuncture", "About 15–30 degrees", "90 degrees", "45 to 60 degrees", "Parallel to the skin"],
  ["Fasting sample for glucose", "At least 8 hours without food", "2 hours without food", "30 minutes without food", "No fasting needed"],
  ["Blood culture before antibiotics", "Increases yield of positive cultures", "Reduces yield", "Has no effect", "Is not recommended"],
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---- "seen" memory: stops the same device from getting repeats until the pool runs out ----
function readSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSeen(list) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable – ignore */
  }
}

// Pick N entries preferring ones this device has not seen yet
function pickRound(n) {
  let seen = readSeen().filter((term) => TERM_POOL.some((e) => e[0] === term));
  let unseen = TERM_POOL.filter((e) => !seen.includes(e[0]));

  let chosen = [];
  if (unseen.length >= n) {
    chosen = shuffle(unseen).slice(0, n);
    seen = [...seen, ...chosen.map((e) => e[0])];
  } else {
    // Pool nearly used up: take what's left, reset memory, fill from the rest
    chosen = [...unseen];
    const rest = shuffle(TERM_POOL.filter((e) => !chosen.includes(e))).slice(0, n - chosen.length);
    chosen = [...chosen, ...rest];
    seen = rest.map((e) => e[0]);
  }
  writeSeen(seen);

  // Build playable questions with a freshly shuffled option order
  return shuffle(chosen).map(([term, correct, ...wrong]) => {
    const options = shuffle([correct, ...wrong]);
    return { term, options, correctIndex: options.indexOf(correct) };
  });
}

export default function SpeedRound() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadLeaderboard();
    loadPeriods();
  }, []);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function loadLeaderboard() {
    fetch(`${API_BASE_URL}/api/sprint/leaderboard?week=${encodeURIComponent(WEEK_ID)}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }

  function loadPeriods() {
    fetch(`${API_BASE_URL}/api/sprint/champions-by-period`)
      .then((res) => res.json())
      .then((data) => setPeriods(data.periods || []))
      .catch(() => {});
  }

  const endRound = useCallback(
    async (finalScore) => {
      clearInterval(timerRef.current);
      setPhase("done");

      if (finalScore >= QUESTIONS_PER_ROUND - 1) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }

      try {
        await fetch(`${API_BASE_URL}/api/sprint/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ week: WEEK_ID, name: name.trim(), score: finalScore }),
        });
      } catch {
        /* ignore – leaderboard will simply not update */
      }
      loadLeaderboard();
      loadPeriods();
    },
    [name]
  );

  async function checkExistingAndStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setChecking(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/sprint/attempt?week=${encodeURIComponent(WEEK_ID)}&name=${encodeURIComponent(name.trim())}`
      );
      const data = await res.json();
      if (data.attempt) {
        setExistingAttempt(data.attempt);
        return;
      }
      startRound();
    } finally {
      setChecking(false);
    }
  }

  function startRound() {
    setRound(pickRound(QUESTIONS_PER_ROUND));
    setStep(0);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setPhase("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      endRound(score);
    }
  }, [timeLeft, phase, score, endRound]);

  function answer(optionIndex) {
    const isCorrect = optionIndex === round[step].correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (step < round.length - 1) {
      setStep((s) => s + 1);
    } else {
      endRound(newScore);
    }
  }

  const current = round[step];
  const currentLeader = leaderboard[0];

  return (
    <section id="speed-round" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">This round's speed round</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          60-Second Term Sprint
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          Match each term to its correct definition before the clock runs out — {QUESTIONS_PER_ROUND} terms,
          drawn at random from a very large pool, with the answers shuffled every time. One attempt per
          person per round.
        </p>

        {currentLeader && (
          <div className="mt-6 flex items-center justify-between rounded-sm border border-coral-500/30 bg-coral-500/5 px-4 py-3">
            <span className="label-tag text-coral-600">Leading this round</span>
            <span className="text-sm font-semibold text-lab-900 dark:text-dark-ink">
              {currentLeader.name} · {currentLeader.score} correct
            </span>
          </div>
        )}

        {leaderboard.length > 0 && (
          <div className="mt-4 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
            <p className="label-tag text-lab-700 dark:text-lab-500">Current round leaderboard</p>
            <div className="mt-2 space-y-1">
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft dark:text-dark-ink-soft">
                    {i + 1}. {entry.name}
                  </span>
                  <span className="font-semibold text-lab-800 dark:text-dark-ink">
                    {entry.score} correct
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {periods.length > 0 && (
          <div className="mt-4 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
            <p className="label-tag text-lab-700 dark:text-lab-500">Recent round champions</p>
            <div className="mt-3 space-y-4">
              {periods.slice(0, 4).map((p) => (
                <div key={p.period}>
                  <p className="label-tag text-ink-soft dark:text-dark-ink-soft">{p.label}</p>
                  <div className="mt-1 space-y-1">
                    {p.top.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-ink-soft dark:text-dark-ink-soft">
                          {["🥇", "🥈", "🥉"][i]} {entry.name}
                        </span>
                        <span className="font-semibold text-lab-800 dark:text-dark-ink">
                          {entry.score} correct
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 max-w-sm"
          >
            <form onSubmit={checkExistingAndStart} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or nickname"
                className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={checking}
                className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
              >
                {checking ? "Checking…" : "Start"}
              </motion.button>
            </form>

            {existingAttempt && (
              <p className="mt-3 text-sm text-coral-600">
                You've already run this round — scored {existingAttempt.score} correct.
                Come back next round for a new one.
              </p>
            )}
          </motion.div>
        )}

        {phase === "playing" && current && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="label-tag text-lab-700 dark:text-lab-500">
                {step + 1}/{round.length} · Score: {score}
              </p>
              <motion.p
                key={timeLeft}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                className={`font-display text-2xl font-bold ${
                  timeLeft <= 10 ? "text-coral-600" : "text-lab-800 dark:text-dark-ink"
                }`}
              >
                {timeLeft}s
              </motion.p>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
              <motion.div
                className={`h-full ${timeLeft <= 10 ? "bg-coral-600" : "bg-coral-500"}`}
                animate={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="mt-5 rounded-sm border border-ink/10 bg-lab-50/50 p-5 dark:border-dark-border dark:bg-dark-surface/40"
              >
                <p className="font-display text-xl font-semibold text-lab-900 dark:text-dark-ink">
                  {current.term}
                </p>
                <div className="mt-4 space-y-2">
                  {current.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => answer(i)}
                      className="block w-full rounded-sm border border-ink/15 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-lab-100/60 dark:border-dark-border dark:text-dark-ink dark:hover:bg-dark-surface/70"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="mt-8 rounded-sm border border-ink/10 bg-lab-50/50 p-6 text-center dark:border-dark-border dark:bg-dark-surface/40"
            >
              <p className="font-display text-3xl font-bold text-lab-900 dark:text-dark-ink">
                {score} correct
              </p>
              <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
                Time's up — check the leaderboard above and come back next round.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}