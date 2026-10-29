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
  ["Howell-Jolly bodies", "Nuclear DNA remnants inside red cells", "Ribosomal RNA remnants inside young red cells", "Denatured haemoglobin attached to the membrane", "Iron-laden mitochondria ringing the nucleus"],
  ["Heinz bodies", "Denatured haemoglobin inclusions in red cells", "Nuclear remnants left behind in mature red cells", "Aggregated ribosomes seen in lead poisoning films", "Malaria parasites growing inside red cells"],
  ["Basophilic stippling", "Aggregated ribosomes in red cells (lead poisoning)", "Nuclear DNA fragments left in red cells after maturation", "Denatured haemoglobin clumps stuck to the membrane", "Clumps of platelets lying over red cells on a film"],
  ["Auer rods", "Needle-like inclusions in myeloblasts", "Needle-like crystals inside plasma cells", "Rod-shaped parasites inside red cells", "Dark inclusions in CLL lymphocytes"],
  ["Smudge cells", "Fragile lymphocytes typical of CLL", "Ruptured platelets in ITP", "Lysed red cells in HDN", "Degenerating neutrophils in sepsis"],
  ["Rouleaux", "Red cells stacked like coins", "Platelets clumped around neutrophils", "Red cells folded into sickle shapes", "Red cells broken into small fragments"],
  ["Target cells (codocytes)", "Red cells with a dark central spot", "Red cells with long sharp spicules", "Red cells folded into sickle shapes", "Red cells with a bite taken out"],
  ["Schistocytes", "Fragmented red cells seen in MAHA and DIC", "Teardrop cells of myelofibrosis", "Spherical cells lacking central pallor", "Cells with Cabot rings"],
  ["Spherocytes", "Red cells lacking central pallor", "Red cells with a dark central bull's-eye spot", "Red cells broken into fragments and helmets", "Elongated oval red cells with blunt ends"],
  ["Dacrocytes", "Red cells shaped like teardrops", "Red cells with regular spiky edges", "Red cells with a bite taken out", "Helmet-shaped fragmented red cells"],
  ["Left shift", "More immature neutrophils (bands) in blood", "More lymphocytes than neutrophils in blood", "Neutrophils with five or more nuclear lobes", "Raised eosinophils in an allergic patient"],
  ["Hypersegmented neutrophils", "Typical of megaloblastic anaemia", "Typical of bacterial infection", "Typical of iron deficiency", "Typical of aplastic anaemia"],
  ["Pelger-Huët anomaly", "Bilobed neutrophil nuclei, normal function", "Giant granules inside all neutrophils", "Neutrophils with five or more lobes", "Neutrophils that completely lack granules"],
  ["Chediak-Higashi syndrome", "Giant lysosomal granules in leukocytes", "Bilobed neutrophils", "Döhle-like bodies with giant platelets", "Absent neutrophils"],
  ["Döhle bodies", "Blue RNA remnants in neutrophil cytoplasm", "Red haemoglobin inclusions in red cells", "Nuclear fragments inside small lymphocytes", "Crystalline rods inside leukaemic blasts"],
  ["Toxic granulation", "Dark coarse granules in infected neutrophils", "Giant granules seen in every white cell type", "Needle-shaped rods inside myeloblast cytoplasm", "Clumps of aggregated platelets on a film"],
  ["MCV", "Average volume of a red cell", "Haemoglobin per cell", "Haemoglobin concentration in packed cells", "Variation in red cell size"],
  ["MCHC", "Haemoglobin concentration per cell volume", "Average volume of a single red cell in femtolitres", "Haemoglobin mass inside one red cell in picograms", "Spread in sizes of the red cells in a sample"],
  ["RDW", "Variation in red cell size (anisocytosis)", "Variation in platelet count over several days", "Average volume of a red cell in femtolitres", "Haemoglobin mass in each red cell in picograms"],
  ["Philadelphia chromosome", "t(9;22) BCR-ABL, seen in CML", "t(15;17), seen in APL", "t(8;14), seen in Burkitt lymphoma", "t(14;18), seen in follicular lymphoma"],
  ["t(15;17)", "Acute promyelocytic leukaemia", "Chronic myeloid leukaemia with BCR-ABL", "Burkitt lymphoma with MYC rearrangement", "Follicular lymphoma with BCL2 rearrangement"],
  ["Reed-Sternberg cell", "Hallmark of Hodgkin lymphoma", "Hallmark of Burkitt lymphoma", "Hallmark of CLL", "Hallmark of multiple myeloma"],
  ["Bence Jones protein", "Free light chains passed in urine", "Albumin leaking in nephrotic syndrome", "Haemoglobin passed after haemolysis", "Myoglobin released after muscle injury"],
  ["Sickle haemoglobin (HbS)", "Glutamic acid replaced by valine at β6", "Glutamic acid replaced by lysine at β6", "Absent β-chains", "Excess δ-chains"],
  ["Haemoglobin C", "Glutamic acid replaced by lysine at β6", "Glutamic acid replaced by valine at β6", "Absent α-chains", "Excess γ-chains"],
  ["Sodium metabisulphite test", "Reducing agent that induces sickling of HbS", "Oxidising agent that causes Heinz bodies", "Stain for reticulocytes", "Anticoagulant for coagulation tests"],
  ["G6PD deficiency", "Enzyme defect causing oxidative haemolysis", "Defect in globin chain production by the marrow", "Defect in red cell membrane proteins like spectrin", "Autoantibodies destroying red cells at body temperature"],
  ["Hereditary spherocytosis", "Defect in membrane proteins like spectrin", "Defect in a red cell glycolytic enzyme", "Defect in globin chain production", "Antibody coating of the red cells"],
  ["Osmotic fragility test", "Red cell resistance to hypotonic saline", "Clot retraction in a glass tube over hours", "Platelet clumping after agonists are added", "Separation of haemoglobin variants on a gel"],
  ["Direct antiglobulin test", "Antibody or complement already on red cells", "Free antibody floating in the patient serum", "Clotting factor levels in citrated plasma", "ABO group by forward typing only"],
  ["Indirect antiglobulin test", "Detects free antibody in serum", "Detects antibody coating the patient's red cells", "Measures haemoglobin", "Counts reticulocytes"],
  ["Stain for reticulocytes", "New methylene blue", "Perls' Prussian blue", "Sudan black B stain", "Leishman stain"],
  ["Perls' Prussian blue", "Stains haemosiderin iron", "Stains reticulocyte RNA", "Stains glycogen", "Stains lipids"],
  ["Sudan Black B", "Stains lipid in myeloid cell granules", "Stains iron in marrow macrophages", "Stains glycogen in lymphoblasts", "Stains acid phosphatase in hairy cells"],
  ["PAS stain", "Detects glycogen and carbohydrates", "Detects iron in macrophages", "Detects lipids in myeloid cells", "Detects RNA in reticulocytes"],
  ["Myeloperoxidase", "Marker of myeloid blasts", "Marker of lymphoid blasts", "Marker of plasma cells", "Marker of megakaryocytes"],
  ["TdT", "Marker of immature lymphoid blasts", "Marker of immature myeloid blasts", "Marker of mature plasma cells", "Marker of platelet precursors"],
  ["Prothrombin time", "Tests extrinsic and common pathways", "Tests the intrinsic pathway only", "Tests platelet adhesion and aggregation", "Tests clot breakdown by plasmin"],
  ["aPTT", "Tests intrinsic and common pathways", "Tests the extrinsic pathway only", "Measures primary haemostasis directly", "Counts platelets in the sample"],
  ["INR", "Standardises PT for warfarin monitoring", "Standardises aPTT for unfractionated heparin monitoring", "Standardises platelet aggregation across analysers", "Measures fibrinogen concentration in plasma"],
  ["Warfarin", "Blocks vitamin K-dependent factors", "Boosts antithrombin activity", "Dissolves fibrin clots directly", "Blocks platelet ADP receptors"],
  ["Heparin", "Enhances antithrombin activity", "Inhibits vitamin K recycling", "Dissolves clots", "Activates platelets"],
  ["Vitamin K-dependent factors", "II, VII, IX and X", "I, V, VIII and XIII", "III, IV, XI and XII", "V, VIII, XI and XII"],
  ["Haemophilia A", "Factor VIII deficiency", "Factor IX deficiency", "Factor XI deficiency", "von Willebrand factor deficiency"],
  ["Haemophilia B", "Factor IX deficiency", "Factor VIII deficiency", "Factor VII deficiency", "Factor XIII deficiency"],
  ["von Willebrand disease", "Defective platelet adhesion due to vWF deficiency", "Defective platelet aggregation due to GPIIb/IIIa", "Factor IX deficiency", "Antithrombin deficiency"],
  ["Glanzmann thrombasthenia", "GPIIb/IIIa defect: no aggregation", "GPIb defect: failed platelet adhesion", "vWF deficiency: reduced adhesion", "Storage granule defect: poor secretion"],
  ["Bernard-Soulier syndrome", "GPIb defect with giant platelets", "GPIIb/IIIa defect with normal platelets", "Factor VIII deficiency with bleeding", "Absent fibrinogen with long clotting"],
  ["D-dimer", "Fibrin breakdown product from clot lysis", "Marker of platelet granule release after activation", "Marker of vitamin K deficiency in newborns", "Marker of antithrombin deficiency in families"],
  ["DIC", "Widespread clotting that uses up factors", "Isolated destruction of platelets only", "Isolated lack of factor VIII only", "Overproduction of platelets in marrow"],
  ["Immune thrombocytopenia", "Antibody-mediated destruction of platelets", "Failure of megakaryocyte development in the marrow", "Hereditary giant platelets with low counts since birth", "Platelet overproduction from a clonal marrow disease"],
  ["Polycythaemia vera", "Clonal rise in red cell mass (JAK2)", "Reactive rise in red cells from hypoxia", "Apparent rise from plasma volume loss", "Rise driven by high erythropoietin"],
  ["JAK2 V617F", "Mutation in PV, ET and myelofibrosis", "Translocation that defines CML", "Fusion gene that defines APL", "Membrane gene defect of spherocytosis"],
  ["Megaloblastic anaemia", "Impaired DNA synthesis from B12 or folate lack", "Defective haem synthesis from lack of dietary iron", "Defective globin chain synthesis from a gene deletion", "Premature destruction of red cells by autoantibodies"],
  ["Pernicious anaemia", "B12 deficiency from lack of intrinsic factor", "Folate deficiency from a poor diet in pregnancy", "Iron deficiency from chronic gastrointestinal blood loss", "Haemolysis from oxidant drug exposure in G6PD deficiency"],
  ["Intrinsic factor", "Made by gastric parietal cells for B12 absorption", "Made by the liver for iron transport in plasma", "Made by the kidney for red cell production signalling", "Made by the pancreas for fat digestion in the gut"],
  ["Sideroblastic anaemia", "Ring sideroblasts from faulty haem synthesis", "Spherocytes from membrane protein defects", "Target cells from globin chain defects", "Megaloblasts from vitamin B12 deficiency"],
  ["Anaemia of chronic disease", "High hepcidin, low iron, normal ferritin", "Low ferritin with high TIBC and low iron", "High ferritin with high TIBC and high iron", "Low hepcidin, high iron, low ferritin"],
  ["Ferritin", "Iron storage protein, low in deficiency", "Iron carrier protein found in plasma", "Enzyme needed for the haem pathway", "Marker of vitamin B12 body stores"],
  ["Transferrin", "Plasma iron transport protein", "Tissue iron storage protein", "Hormone regulating iron absorption", "Precursor of haem"],
  ["TIBC in iron deficiency", "Increased", "Decreased", "Unchanged", "Undetectable"],
  ["Hepcidin", "Hormone that blocks iron release by ferroportin", "Hormone that stimulates red cell production in marrow", "Enzyme of the haem synthesis pathway in the cell", "Transport protein carrying iron around in plasma"],
  ["Erythropoietin", "Kidney hormone stimulating red cell production", "Liver hormone stimulating platelet production", "Marrow hormone stimulating neutrophils", "Spleen hormone destroying old red cells"],
  ["Thrombopoietin", "Liver-made hormone driving platelet production", "Kidney-made hormone driving red cell production in marrow", "Splenic hormone that destroys ageing platelets", "Clotting factor made in the liver from vitamin K"],
  ["Leukaemoid reaction", "Reactive rise in WBC with high LAP score", "Clonal rise in WBC with low LAP score", "Pancytopenia with circulating blasts", "Isolated rise in eosinophils only"],
  ["Aplastic anaemia", "Pancytopenia with a hypocellular marrow", "Pancytopenia with a hypercellular marrow", "Isolated raised platelets", "Macrocytosis with circulating blasts"],
  ["Myelodysplastic syndrome", "Clonal marrow disorder, ineffective production", "Reactive marrow response to severe infection in adults", "Inherited defect of platelet function from childhood", "Autoimmune destruction of red cells by warm antibodies"],
  ["Infectious mononucleosis", "EBV infection with atypical lymphocytes", "Blast crisis of chronic leukaemia with a high count", "Neutrophilia with toxic granulation and a left shift", "Eosinophilia from migrating helminth larvae in tissue"],
  ["Monospot test", "Detects heterophile antibodies (glandular fever)", "Detects HBsAg in the serum of hepatitis B patients", "Detects Salmonella agglutinins in the serum in typhoid", "Detects rheumatoid factor in the serum in arthritis"],
  ["Eosinophilia", "Raised in parasite infections and allergy", "Raised in acute bacterial sepsis", "Raised in aplastic anaemia at diagnosis", "Raised during high-dose steroid therapy"],
  ["Neutropenia", "Absolute neutrophil count below 1.5 × 10⁹/L", "Absolute neutrophil count above 7.5 × 10⁹/L", "Platelet count below 150 × 10⁹/L", "Haemoglobin below 12 g/dL"],
  ["Causes of a raised ESR", "Raised fibrinogen and immunoglobulins", "Sickle cells present in the sample", "Polycythaemia with high haematocrit", "Microcytosis with small red cells"],
  ["Reticulocyte count", "Measures marrow red cell output", "Measures the average lifespan of the red cells", "Measures stored iron available in the liver", "Measures platelet function after aspirin exposure"],
  ["Cabot rings", "Ring remnants of the mitotic spindle", "Rings of ribosomes in lead poisoning", "Ring sideroblasts in marrow iron stain", "Rings of denatured haemoglobin"],
  ["Pappenheimer bodies", "Iron granules that stain with Perls'", "Nuclear fragments inside red cells", "Denatured haemoglobin inside red cells", "Clumps of platelet granules on red cells"],
  ["Burr cells (echinocytes)", "Red cells with regular short projections", "Red cells with irregular spikes (acanthocytes)", "Red cells with a bite removed", "Red cells shaped like teardrops"],
  ["Hairy cell leukaemia", "B-cell leukaemia, TRAP positive, BRAF V600E", "T-cell leukaemia caused by HTLV-1 infection in adults", "Myeloid leukaemia with Auer rods and a t(15;17)", "Plasma cell leukaemia with paraprotein in the serum"],
  ["Multiple myeloma", "Clonal plasma cell cancer with paraprotein", "Clonal T-cell cancer of lymph nodes", "Reactive rise of plasma cells in infection", "Inherited platelet disorder with bleeding"],
  ["Blast crisis", "Late phase of CML with over 20% blasts", "Severe acute transfusion reaction", "Fever with a very low neutrophil count", "Hyperviscosity syndrome in myeloma"],

  // ---------- CLINICAL CHEMISTRY ----------
  ["ALT", "Liver enzyme raised in hepatocellular injury", "Enzyme specific for bile duct obstruction and cholestasis", "Cardiac muscle enzyme raised after myocardial infarction", "Pancreatic digestive enzyme raised in acute pancreatitis"],
  ["AST", "Enzyme in liver, heart and muscle", "Enzyme confined to bile duct cells", "Enzyme confined to pancreatic acini", "Enzyme confined to bone osteoblasts"],
  ["ALP", "Raised in cholestasis and bone disease", "Raised only in hepatitis", "Raised only in myocardial infarction", "Raised only in pancreatitis"],
  ["GGT", "Sensitive marker of cholestasis and alcohol", "Specific marker of bone disease activity", "Cardiac marker of myocardial injury", "Marker of skeletal muscle damage"],
  ["Lipase", "More specific than amylase in pancreatitis", "Marker of acute myocardial infarction in the first hours", "Marker of cholestatic liver disease and bile obstruction", "Marker of bone turnover seen in Paget's disease"],
  ["CK-MB", "Cardiac isoenzyme raised in infarction", "Brain isoenzyme raised after stroke", "Liver isoenzyme raised in cholestasis", "Bone isoenzyme raised after fractures"],
  ["Troponin I and T", "Most specific markers of heart injury", "Markers of cholestatic liver disease", "Markers of kidney tubular damage", "Markers of thyroid hormone status"],
  ["LDH", "Enzyme raised in haemolysis and tissue injury", "Enzyme confined to liver cells and bile ducts only", "Enzyme confined to bone cells and growing cartilage only", "Enzyme confined to pancreatic cells and salivary glands only"],
  ["Haptoglobin", "Binds free haemoglobin; low in haemolysis", "Rises sharply in intravascular haemolysis", "Carries iron in the plasma", "Stores iron inside tissue cells"],
  ["Conjugated bilirubin", "Water-soluble form raised in obstructive jaundice", "Water-insoluble form raised in haemolysis and Gilbert syndrome", "Form bound tightly to albumin in the blood only", "Form that is never found in the urine of patients"],
  ["Unconjugated hyperbilirubinaemia", "Typical of haemolysis and Gilbert syndrome", "Typical of bile duct obstruction by gallstones or tumour", "Typical of Dubin-Johnson syndrome with a black liver", "Typical of primary biliary cholangitis in middle-aged women"],
  ["Urine urobilinogen in obstructive jaundice", "Reduced or absent", "Markedly increased", "Unchanged", "Present only in stool"],
  ["Pre-hepatic jaundice", "Excess bilirubin production, e.g. haemolysis", "Blocked bile flow from the liver into the intestine", "Damage to hepatocytes from viral hepatitis infection", "Failure of bile secretion into the gut after surgery"],
  ["Creatinine clearance", "Estimates glomerular filtration rate", "Measures tubular secretion only", "Measures urine concentrating ability", "Measures protein loss"],
  ["Cystatin C", "GFR marker not affected by muscle mass", "Marker of acute cardiac injury within hours of onset", "Marker of liver synthetic function and clotting factors", "Enzyme released into the blood in acute pancreatitis"],
  ["HbA1c", "Reflects average glucose over 8–12 weeks", "Reflects glucose over the last 24 hours", "Reflects glucose over one week", "Reflects glucose over one year"],
  ["Fructosamine", "Glycaemic control over about 2–3 weeks", "Glycaemic control over about 3 months", "Glycaemic control over the past day", "Glycaemic control over the past year"],
  ["Ketone bodies", "Acetoacetate, β-hydroxybutyrate, acetone", "Pyruvate, lactate and alanine from muscle breakdown", "Urea, creatinine and uric acid from protein turnover", "Bilirubin, biliverdin and urobilin from haem breakdown"],
  ["Nitroprusside reaction", "Detects acetoacetate in urine", "Detects glucose in urine", "Detects bilirubin in urine", "Detects protein in urine"],
  ["Anion gap", "Na⁺ − (Cl⁻ + HCO₃⁻)", "Cl⁻ − (Na⁺ + HCO₃⁻)", "Ca²⁺ − (Mg²⁺ + K⁺)", "HCO₃⁻ − Cl⁻"],
  ["Metabolic acidosis", "Low pH with low bicarbonate", "Low pH with high pCO₂", "High pH with low pCO₂", "High pH with high bicarbonate"],
  ["Respiratory alkalosis", "High pH with low pCO₂", "Low pH with high pCO₂", "High pH with high bicarbonate", "Low pH with low bicarbonate"],
  ["Pseudohyperkalaemia", "False high K⁺ from haemolysis or delay", "True potassium excess from kidney failure", "Potassium raised by giving insulin", "Potassium lowered by the sample clotting"],
  ["Osmolality", "Solute particles per kilogram of water", "Solute mass per litre of solution", "Hydrogen ion level of a solution", "Thickness (viscosity) of a solution"],
  ["Friedewald equation", "Estimates LDL from TC, HDL and triglycerides", "Estimates GFR from creatinine and age", "Estimates anion gap from Na, K and Cl", "Estimates osmolality from glucose and urea"],
  ["Lipaemic sample", "Milky plasma from triglycerides", "Pink plasma from haemolysis", "Yellow-brown plasma from bilirubin", "Clotted plasma from poor mixing"],
  ["Beer-Lambert law", "Absorbance is proportional to concentration", "Absorbance falls steadily as the concentration rises", "Emitted light rises steadily with the flame temperature", "Voltage is proportional to the ion activity measured"],
  ["Flame photometry", "Na and K measured by emitted light", "Proteins measured by absorbance", "pH measured with a glass electrode", "Osmolality measured by freezing point"],
  ["Ion-selective electrode", "Measures ion activity through a potential difference", "Measures light absorbed by a coloured reaction product", "Measures fluorescence emitted from an antibody label", "Measures dissolved gases after separation by chromatography"],
  ["Corrected calcium", "Adjusts total calcium for albumin level", "Adjusts calcium for haemolysis and sample appearance", "Adjusts calcium for the age of the stored sample", "Adjusts calcium for tourniquet time at collection"],
  ["Parathyroid hormone", "Raises serum calcium", "Lowers serum calcium", "Raises serum phosphate", "Lowers serum magnesium"],
  ["Low fT4 with high TSH", "Primary hypothyroidism", "Graves disease", "Secondary hypothyroidism", "Subclinical hyperthyroidism"],
  ["Cortisol diurnal rhythm", "Highest in the early morning", "Highest at midnight", "Constant throughout the day", "Highest in the late afternoon"],
  ["AFP", "Marker of hepatocellular carcinoma", "Marker of prostate carcinoma and benign hyperplasia", "Marker of colorectal carcinoma and recurrence", "Marker of ovarian carcinoma and recurrence"],
  ["PSA", "Tumour marker for prostate disease", "Tumour marker for liver cancer", "Tumour marker for bowel cancer", "Tumour marker for pancreatic cancer"],
  ["CA-125", "Marker used in ovarian cancer monitoring", "Marker of hepatocellular carcinoma in cirrhotic patients", "Marker of prostate cancer in older male patients", "Marker of colon cancer in patients after surgery"],
  ["β-hCG", "Pregnancy and trophoblastic tumours", "Thyroid carcinoma monitoring only", "Liver carcinoma monitoring only", "Bone turnover monitoring only"],
  ["C-reactive protein", "Acute-phase protein made by the liver", "Antibody made by plasma cells", "Complement component made in plasma", "Clotting factor made in the liver"],
  ["Uric acid", "End-product of purine metabolism", "End-product of protein metabolism", "End-product of haem breakdown", "End-product of creatine breakdown"],
  ["Albumin", "Main protein holding oncotic pressure", "Main protein carrying iron in plasma", "Main protein driving clot formation", "Main antibody class in plasma"],
  ["Nephrotic syndrome", "Heavy proteinuria, low albumin, oedema", "Haematuria with red cell casts", "Glycosuria with normal blood glucose", "Raised urea with normal creatinine"],
  ["Microalbuminuria", "Early sign of diabetic kidney damage", "Early sign of acute liver failure", "Early sign of urinary tract infection", "Early sign of congestive heart failure"],
  ["Acute kidney injury", "Rapid creatinine rise or falling urine", "Slow decline over three months", "Isolated raised bilirubin level", "Isolated proteinuria without creatinine rise"],

  // ---------- QUALITY & STATISTICS ----------
  ["Levey-Jennings chart", "QC values plotted against mean ± SD", "Patient results plotted against age", "Reagent costs plotted over time", "Turnaround times plotted by shift"],
  ["Westgard 1-3s rule", "One control beyond ±3 SD, suggesting random error", "Two controls beyond ±2 SD, suggesting systematic error", "Four controls beyond 1 SD on one side", "Ten consecutive controls on one side of the mean"],
  ["Westgard 10x rule", "Ten controls on one side of the mean", "One control more than three SD from the mean", "Range between two controls exceeding four SD", "Two controls beyond two SD in opposite directions"],
  ["QC shift", "Sudden change in the mean of controls", "Slow drift of the controls in one direction", "Random scatter of the controls around the mean", "Complete loss of the signal from the instrument"],
  ["QC trend", "Gradual drift of controls in one direction", "Sudden jump in the mean of the control values", "Random scatter of the controls around the mean", "One isolated outlier result among the controls"],
  ["Precision", "Reproducibility of repeated measurements", "Closeness of the result to the true value", "Lowest amount that the method can detect reliably", "Ability of a method to measure only the analyte"],
  ["Accuracy", "Closeness of a result to the true value", "Reproducibility of repeated results on one sample", "Lowest amount of analyte that the method can detect", "Range of values reported by the laboratory for patients"],
  ["Diagnostic sensitivity", "Proportion of diseased people correctly identified", "Proportion of healthy people correctly identified", "Proportion of positive results that are true", "Proportion of negative results that are true"],
  ["Diagnostic specificity", "Proportion of healthy people correctly identified", "Proportion of diseased people correctly identified", "Proportion of positive results that are true", "Overall proportion correctly classified"],
  ["Positive predictive value", "True positives among all positive results", "Diseased people correctly identified", "Healthy people correctly identified", "True negatives among all negative results"],
  ["Limit of detection", "Lowest amount reliably distinguished from a blank", "Highest amount that the method can measure accurately", "Lowest amount that can be quantified with set precision", "Average of the replicate control measurements over a month"],
  ["Delta check", "Result compared with the patient's last one", "Results compared between two different analysers in the lab", "Results compared between two reagent lots in use", "Results compared between two members of staff on duty"],
  ["Coefficient of variation", "SD divided by mean, times 100", "Mean divided by SD, times 100", "Highest value minus lowest value", "Middle value of a data set"],
  ["Reference interval", "Usually the central 95% of a healthy population", "The full range of values seen in a healthy population", "The range of values seen in a sick population", "The range of values of the control material in use"],
  ["Calibration vs QC", "Calibration sets the instrument; QC checks it", "Both mean exactly the same thing", "QC sets the instrument; calibration checks it", "Calibration is done once at purchase"],
  ["ISO 15189", "Standard for medical laboratory quality", "Standard for blood bank labelling only", "Standard for laboratory building design", "Standard for reagent manufacturing"],
  ["Internal quality control", "Daily testing of control material", "Exchange of samples with other labs", "Review of staff leave records", "Audit of reagent expiry dates only"],
  ["Proficiency testing", "Blind samples from an outside provider", "Daily control runs performed by staff on the bench", "Annual interviews with laboratory staff about training", "Scheduled servicing of the laboratory equipment on site"],
  ["Turnaround time", "Time from receipt of request to result", "Time taken to centrifuge a sample before analysis", "Time an analyser needs to warm up each morning", "Time a sample is kept in storage after reporting"],
  ["Critical value", "Result requiring immediate notification to the clinician", "Result outside the reference range by any small amount", "Result of an internal control that fails the QC rules", "Result from a rejected sample that is reported late"],

  // ---------- MICROBIOLOGY ----------
  ["Catalase test", "Staphylococci positive, streptococci negative", "Streptococci positive, staphylococci negative", "Distinguishes E. coli from Klebsiella", "Identifies pneumococci"],
  ["Coagulase test", "Separates S. aureus from other staphylococci", "Separates the Lancefield groups of the streptococci", "Identifies members of the family Enterobacteriaceae", "Detects beta-lactamase production by Haemophilus influenzae"],
  ["Oxidase test", "Positive in Pseudomonas and Neisseria", "Positive in Escherichia coli and Klebsiella species", "Positive in Klebsiella pneumoniae and Enterobacter species", "Positive in Salmonella species and Shigella species"],
  ["Optochin sensitivity", "Identifies Streptococcus pneumoniae", "Identifies Streptococcus pyogenes", "Identifies Staphylococcus aureus", "Identifies Enterococcus"],
  ["Bacitracin sensitivity", "Presumptive test for Group A streptococci", "Presumptive test for pneumococci", "Presumptive test for S. aureus", "Presumptive test for Group B streptococci"],
  ["CAMP test", "Identifies Group B streptococcus", "Identifies Group A streptococcus", "Identifies Streptococcus pneumoniae", "Identifies Enterococcus faecalis"],
  ["Beta haemolysis", "Complete clearing of blood around colonies", "Green discolouration of the blood around the colonies", "No change at all in the blood around the colonies", "Black pigment formed in the blood around the colonies"],
  ["Alpha haemolysis", "Partial lysis with a green zone", "Complete clearing around colonies", "No change in the blood agar", "A double zone of clearing"],
  ["Acid-fast bacilli", "Resist acid-alcohol due to mycolic acid", "Lose crystal violet very quickly during decolourisation", "Have no cell wall at all and cannot be Gram stained", "Stain only with Giemsa dye and not with carbol fuchsin"],
  ["Ziehl-Neelsen stain", "Stains acid-fast bacilli red on blue", "Stains Gram-negative rods pink on blue", "Stains bacterial spores green on red", "Stains capsules clear on a dark field"],
  ["Auramine-phenol", "Fluorescent stain for acid-fast bacilli", "Fluorescent stain for bacterial spores", "Fluorescent stain for capsules", "Fluorescent stain for fungi only"],
  ["Löwenstein-Jensen medium", "Egg-based medium for M. tuberculosis", "Selective medium for Salmonella", "Selective medium for Vibrio cholerae", "Selective medium for Neisseria"],
  ["MacConkey agar", "Selective and differential for enteric bacilli", "Enriched medium for fastidious organisms like Haemophilus", "Selective medium for Vibrio cholerae and its relatives", "Selective medium for fungi in respiratory specimens"],
  ["XLD agar", "Selective for Salmonella and Shigella", "Selective for Vibrio cholerae", "Selective for Neisseria species", "Selective for Staphylococcus aureus"],
  ["TCBS agar", "Selective for Vibrio; V. cholerae yellow", "Selective for Salmonella; colonies black", "Selective for Shigella; colonies red", "Selective for fungi; colonies white"],
  ["Chocolate agar", "Enriched medium for Haemophilus, Neisseria", "Selective medium used for Salmonella and Shigella isolation", "Selective medium used for yeasts and moulds in sputum", "Selective medium used for Mycobacterium tuberculosis isolation"],
  ["Satellitism", "Haemophilus growing around Staphylococcus", "Staphylococcus growing around Pseudomonas", "Colonies spreading in a swarming film", "Colonies growing deep inside the agar"],
  ["Cary-Blair medium", "Transport medium for stool pathogens", "Enrichment medium for Neisseria from genital swabs", "Growth medium for Mycobacterium tuberculosis in sputum", "Anaerobic growth medium for Clostridium species only"],
  ["Widal test", "Antibodies to Salmonella Typhi O and H", "Antibodies to Brucella abortus antigens", "Hepatitis B surface antigen detection", "Malaria parasite antigen detection"],
  ["TSI acid butt, alkaline slant", "Glucose fermentation only", "Fermentation of lactose and sucrose", "No fermentation", "Urea hydrolysis"],
  ["Urease-positive rapidly", "Proteus species", "Escherichia coli", "Salmonella Typhi", "Shigella species"],
  ["Indole-positive organism", "Escherichia coli", "Klebsiella pneumoniae", "Enterobacter cloacae", "Salmonella Typhi"],
  ["Citrate-positive organism", "Klebsiella pneumoniae", "Escherichia coli (typical)", "Shigella dysenteriae type 1", "Salmonella enterica Typhi"],
  ["Kirby-Bauer method", "Disk diffusion read by zone diameter", "Broth dilution used to find the MBC", "Gram staining of isolated colonies", "Anaerobic culture in a gas jar"],
  ["MIC", "Lowest drug level stopping visible growth", "Lowest drug level killing 99.9% of the inoculum", "Highest dose that a patient can tolerate safely", "Zone diameter of inhibition around a disk in mm"],
  ["ESBL", "Enzymes that break third-generation cephalosporins", "Enzymes that inactivate rifampicin in M. tuberculosis", "Enzymes that modify the bacterial ribosome target", "Pumps that expel tetracycline out of bacterial cells"],
  ["MRSA", "S. aureus carrying mecA and PBP2a", "S. aureus lacking coagulase", "Streptococcus resistant to penicillin", "Enterococcus resistant to vancomycin"],
  ["Mueller-Hinton agar", "Standard medium for disk diffusion", "Selective medium for Salmonella", "Selective medium for Mycobacteria", "Selective medium for fungi"],
  ["0.5 McFarland standard", "Turbidity standard for bacterial suspensions", "Reference standard for adjusting the pH of media", "Reference standard for counting colonies on a plate", "Reference standard for incubator heat and humidity"],
  ["Autoclave conditions", "121 °C at 15 psi for 15–20 minutes", "100 °C at normal pressure for 30 minutes", "160 °C in dry heat for 2 hours", "72 °C for 15 seconds in a holding tube"],
  ["Hot air oven conditions", "160 °C for 2 hours", "121 °C for 15 minutes", "100 °C for 5 minutes", "56 °C for 30 minutes"],
  ["Geobacillus stearothermophilus", "Spore indicator used to test autoclaves", "Organism used to test the hot air oven cycle", "Bacterium that is a common cause of food poisoning", "Quality control strain used for the Gram stain"],
  ["Class II biosafety cabinet", "Protects user, sample and environment (HEPA)", "Protects only the user from aerosols and splashes", "Gives no protection to the sample inside the cabinet", "Designed for handling chemical fumes and volatile solvents"],
  ["Vibrio cholerae", "Comma-shaped rod causing rice-water stools", "Spiral organism that causes syphilis in adults and infants", "Gram-positive coccus found in clusters in skin pus", "Acid-fast rod that causes tuberculosis in the lung"],
  ["Albert's stain", "Shows granules of C. diphtheriae", "Stains acid-fast mycobacteria red", "Stains the bacterial capsule", "Stains bacterial endospores green"],
  ["Neisseria gonorrhoeae", "Gram-negative diplococci inside pus cells", "Gram-positive cocci arranged in chains", "Acid-fast rods inside macrophages", "Spiral bacteria seen in dark field"],
  ["Treponema pallidum", "Spirochaete causing syphilis, seen in dark field", "Gram-negative rod causing typhoid fever and enteric disease", "Gram-positive rod causing diphtheria in the upper airway", "Acid-fast rod causing leprosy in skin and peripheral nerves"],
  ["Mycoplasma", "Bacterium with no cell wall", "Acid-fast bacterium", "Bacterium with a capsule", "Spore-forming rod"],
  ["India ink preparation", "Negative stain showing Cryptococcus capsule", "Positive stain used for acid-fast bacilli in sputum", "Positive stain used for bacterial spores on a smear", "Positive stain used for iron deposits in tissue"],
  ["Germ tube test", "Positive for Candida albicans", "Positive for Cryptococcus", "Positive for Aspergillus", "Positive for dermatophytes"],
  ["KOH preparation", "Dissolves keratin to show fungal elements", "Stains bacteria blue so they show up under the microscope", "Preserves ova and cysts in stool for later examination", "Detects antibodies in serum samples from infected patients"],
  ["Dermatophytes", "Fungi infecting skin, hair and nails", "Fungi that cause fungal meningitis", "Fungi that cause pneumonia only", "Fungi found only in blood culture"],
  ["Clostridium tetani", "Spore-forming anaerobe causing tetanus", "Gram-negative diplococcus in pus cells", "Acid-fast rod found in sputum smears", "Facultative anaerobic coccus in clusters"],
  ["Helicobacter pylori", "Curved Gram-negative rod, urease-positive", "Gram-positive coccus growing in clusters", "Acid-fast rod found in sputum smears", "Spore-forming anaerobic Gram-positive rod"],
  ["Bordetella pertussis", "Causes whooping cough; Bordet-Gengou agar", "Causes diphtheria; Loeffler serum slope", "Causes typhoid; grows on XLD agar", "Causes cholera; grows on TCBS agar"],
  ["Brucella", "Small Gram-negative coccobacilli, undulant fever", "Large Gram-positive rods causing anthrax in livestock workers", "Thin spiral spirochaetes with endoflagella causing relapsing fever", "Acid-fast rods growing very slowly on egg-based medium"],
  ["Enterococcus faecalis", "Grows in 6.5% NaCl, bile-aesculin positive", "Optochin sensitive with bile-soluble colonies", "Catalase positive and coagulase negative", "Coagulase positive with golden colonies"],

  // ---------- PARASITOLOGY ----------
  ["Plasmodium falciparum", "Multiple rings per cell, banana gametocytes", "Enlarged red cells with Schüffner's dots", "Band-form trophozoites across the cell", "Rosette schizonts with 8 merozoites"],
  ["Schüffner's dots", "Seen in red cells with P. vivax or P. ovale", "Seen in red cells infected with P. falciparum trophozoites", "Seen only in red cells infected with P. malariae bands", "Seen only in red cells infected with Babesia parasites"],
  ["Maurer's clefts", "Seen in red cells with P. falciparum", "Seen in red cells with P. vivax", "Seen in red cells with P. malariae", "Seen in red cells with Babesia"],
  ["Plasmodium malariae", "Band-form trophozoites and a 72-hour cycle", "48-hour cycle with enlarged red cells and Schüffner's dots", "Banana-shaped gametocytes with multiple ring forms in cells", "24-hour cycle only with high parasitaemia in the blood"],
  ["Plasmodium knowlesi", "24-hour cycle, mimics P. malariae on film", "72-hour cycle with band-form trophozoites", "48-hour cycle with Schüffner's dots", "Banana gametocytes with multiple rings"],
  ["Thick blood film", "Concentrates parasites for detection", "Used for species identification only", "Used for cell counting only", "Used for Gram staining"],
  ["Thin blood film", "Species identification and parasite percentage", "Detection of very low parasitaemia in febrile patients only", "Blood grouping by forward typing with anti-A and anti-B", "Erythrocyte sedimentation rate testing in Westergren tubes"],
  ["Field's stain", "Rapid stain for malaria thick films", "Fluorescent stain for acid-fast bacilli", "Spore stain using malachite green", "Iron stain using potassium ferrocyanide"],
  ["Giemsa pH for malaria", "7.2", "5.0", "9.0", "3.5"],
  ["Anopheles", "Female mosquito that transmits malaria", "Mosquito that transmits dengue", "Fly that transmits sleeping sickness", "Fly that transmits river blindness"],
  ["Hypnozoites", "Dormant liver stages of P. vivax and P. ovale", "Sexual stages circulating in the blood", "Infective stages in mosquito salivary glands", "Asexual stages bursting from red cells"],
  ["HRP-2 antigen", "Rapid test target specific to P. falciparum", "Rapid test target specific for P. vivax infection only", "Rapid test marker of HIV infection in infants only", "Rapid test marker of typhoid fever in endemic areas"],
  ["Ascaris lumbricoides", "Large roundworm with mamillated eggs", "Pinworm with flat-sided eggs seen on tape swabs", "Whipworm with barrel-shaped eggs and two polar plugs", "Hookworm with thin-shelled eggs and few cells inside"],
  ["Trichuris trichiura", "Whipworm, barrel eggs with polar plugs", "Roundworm with mamillated thick-shelled eggs", "Pinworm with flat-sided embryonated eggs", "Beef tapeworm with radially striated eggs"],
  ["Enterobius vermicularis", "Pinworm, found on cellophane tape swab", "Whipworm, found in stool concentrates", "Hookworm, found on a blood film", "Roundworm, found in sputum samples"],
  ["Hookworm eggs", "Thin shell with several cells inside", "Barrel shape with two polar plugs", "Thick mamillated outer shell coat", "Large egg with a lateral spine"],
  ["Strongyloides stercoralis", "Rhabditiform larvae in stool, autoinfection", "Eggs with a lateral spine passed in stool or urine", "Barrel-shaped eggs with polar plugs passed in stool", "Gravid proglottids passed in the stool of the patient"],
  ["Taenia saginata", "Beef tapeworm, over 12 uterine branches", "Pork tapeworm with 7–13 uterine branches", "Fish tapeworm with an operculated egg", "Dwarf tapeworm with polar filaments"],
  ["Taenia solium", "Pork tapeworm, can cause neurocysticercosis", "Beef tapeworm with over 12 uterine branches per side", "Fish tapeworm that can cause vitamin B12 deficiency", "Dog tapeworm that causes hydatid cysts in the liver"],
  ["Schistosoma mansoni", "Lateral-spined eggs found in stool", "Terminal-spined eggs passed in the urine at midday", "Barrel-shaped eggs with plugs found in stool samples", "Active larvae wriggling in fresh stool samples"],
  ["Schistosoma haematobium", "Terminal-spined eggs found in urine", "Lateral-spined eggs found in stool and rectal snips", "Round eggs without a spine found in sputum samples", "Active larvae circulating in the peripheral blood film"],
  ["Entamoeba histolytica", "Trophozoites containing ingested red cells", "Pear-shaped trophozoites with two nuclei", "Acid-fast oocysts", "Banana-shaped gametocytes"],
  ["Giardia lamblia", "Pear-shaped trophozoites with two nuclei", "Trophozoites containing ingested red blood cells in stool", "Acid-fast oocysts seen with modified Ziehl-Neelsen stain", "Rice-water stools passing in a patient with severe dehydration"],
  ["Cryptosporidium", "Acid-fast oocysts on modified ZN", "Pear-shaped flagellate with two nuclei", "Amoeba containing ingested red cells", "Barrel-shaped eggs with polar plugs"],
  ["Trypanosoma brucei", "Sleeping sickness, spread by tsetse fly", "Chagas disease, spread by kissing bugs", "Kala-azar, spread by sandflies", "Malaria, spread by anopheline mosquitoes"],
  ["Leishmania donovani", "Kala-azar, LD bodies in macrophages", "Sleeping sickness, trypomastigotes in blood", "Chagas disease, amastigotes in heart muscle", "River blindness, microfilariae in skin"],
  ["Wuchereria bancrofti", "Lymphatic filariasis, sheathed microfilariae at night", "River blindness, unsheathed microfilariae in the skin snips", "Eye worm, daytime microfilariae in the peripheral blood", "Guinea worm, adult females emerging from the legs of patients"],
  ["Loa loa", "Eye worm, Chrysops fly, daytime blood", "Night-biting filarial worm of lymphatics", "Skin worm causing river blindness", "Guinea worm of drinking water"],
  ["Onchocerca volvulus", "River blindness, diagnosed by skin snips", "Eye worm, diagnosed by night blood", "Elephantiasis worm, diagnosed by night blood", "Sleeping sickness agent, found in CSF"],
  ["Formol-ether concentration", "Concentrates parasite eggs and cysts in stool", "Stains malaria parasites in thick and thin blood films", "Stains acid-fast bacilli in sputum smears from patients", "Tests stool for the presence of occult blood loss"],
  ["Kato-Katz technique", "Quantitative thick smear of stool for helminth eggs", "Stain used for blood parasites on thin blood films", "Antibody test used for malaria screening in the field", "Culture method used for amoebae from stool samples"],
  ["Toxoplasma gondii", "Protozoan with the cat as definitive host", "Amoeba acquired from contaminated water", "Flagellate causing chronic watery diarrhoea", "Tapeworm acquired from undercooked beef"],
  ["Trichomonas vaginalis", "Motile flagellate causing vaginitis", "Budding yeast causing vaginal thrush", "Gram-positive coccus causing vaginosis", "Spirochaete causing genital ulcers"],

  // ---------- IMMUNOLOGY, SEROLOGY & VIROLOGY ----------
  ["IgM", "Pentamer; first antibody in a primary response", "Only antibody class that crosses the placenta to the fetus", "Main antibody of mucosal secretions such as saliva and tears", "Antibody class bound to mast cells in allergic disease"],
  ["IgG", "Only class that crosses the placenta", "Pentamer; first antibody in a primary response", "Dimer; antibody of mucosal secretions", "Antibody class bound to mast cells"],
  ["IgA", "Dimer; main antibody of secretions", "Pentamer; first antibody produced", "Only class that crosses the placenta", "Class that sensitises mast cells"],
  ["IgE", "Antibody of allergy and helminth infection", "Dimer; the main antibody class of mucosal secretions", "Only antibody class that crosses the placenta to the fetus", "Pentamer; the first antibody class produced in infection"],
  ["Type I hypersensitivity", "IgE-mediated immediate reaction, e.g. anaphylaxis", "Antibody-mediated cytotoxic reaction against cell surface antigens", "Immune complex deposition in blood vessel walls and glomeruli", "Delayed T-cell mediated reaction peaking at 48 hours"],
  ["Type II hypersensitivity", "Antibody-mediated cytotoxicity, e.g. mismatched transfusion", "IgE-mediated immediate reaction on mast cells, e.g. anaphylaxis", "Immune complex deposition in blood vessel walls and glomeruli", "Delayed T-cell mediated reaction peaking at 48 hours in skin"],
  ["Type III hypersensitivity", "Immune complex deposition, e.g. SLE", "IgE-mediated immediate reaction, e.g. anaphylaxis", "Antibody-mediated cytotoxic reaction to cells", "Delayed T-cell mediated reaction at 48 hours"],
  ["Type IV hypersensitivity", "Delayed T-cell reaction, e.g. Mantoux test", "IgE-mediated immediate reaction, e.g. anaphylaxis", "Immune complex deposition in tissues", "Antibody-mediated cytotoxic reaction to cells"],
  ["ELISA", "Enzyme-linked assay with a colour readout", "Gel separation of DNA fragments by size", "Staining of tissue sections on slides", "Culture of bacteria on enriched media"],
  ["Western blot", "Detects proteins by antibody binding on a membrane", "Detects DNA sequences by hybridisation with labelled probes", "Detects RNA sequences by hybridisation with labelled probes", "Counts and sorts cells by size using lasers and detectors"],
  ["CD4 count", "Tracks immune status in HIV infection", "Tracks viral replication in hepatitis B", "Tracks glomerular filtration in kidney disease", "Tracks parasite density in malaria"],
  ["p24 antigen", "HIV core protein in fourth-generation assays", "HIV envelope glycoprotein used in confirmatory blots", "Hepatitis B surface antigen found in infected serum", "Epstein-Barr virus capsid marker found in saliva"],
  ["PCR", "Amplifies DNA by repeated heat cycles", "Separates proteins by molecular size", "Stains tissue sections on slides", "Counts blood cells by impedance"],
  ["Viral load", "Copies of viral RNA per mL, monitors ART", "Number of CD4 cells per microlitre", "Level of circulating specific antibody", "Level of C-reactive protein in serum"],
  ["HBsAg", "Surface antigen, marks current HBV infection", "Marker of vaccine-induced immunity only in healthy adults", "Marker of past resolved infection only in recovered patients", "Marker of hepatitis A infection in recent travellers"],
  ["Anti-HBs", "Immunity after vaccination or recovery", "Marker of acute hepatitis B infection", "Marker of high HBV infectivity", "Marker of chronic HBV carriage"],
  ["Anti-HBc IgM", "Marker of acute hepatitis B", "Marker of vaccination immunity", "Marker of hepatitis A", "Marker of hepatitis C"],
  ["HBeAg", "High replication and infectivity in hepatitis B", "Marker of vaccine-induced immunity in health workers", "Marker of hepatitis A infection in school outbreaks", "Marker of recovery from hepatitis B with immunity"],
  ["ANA", "Autoantibodies to nuclear components, e.g. SLE", "Antibodies directed against HIV proteins", "Antibodies directed against hepatitis B", "Antibodies directed against Salmonella O antigen"],
  ["Anti-dsDNA", "Highly specific for SLE", "Specific for rheumatoid arthritis", "Specific for coeliac disease", "Specific for HIV"],
  ["Rheumatoid factor", "IgM antibody against the Fc portion of IgG", "IgG antibody directed against double-stranded DNA in SLE", "Antibody directed against citrullinated peptides in joints", "Antibody directed against mitochondria in biliary disease"],
  ["Anti-CCP", "Highly specific antibody in rheumatoid arthritis", "Highly specific antibody found mainly in lupus patients", "Highly specific antibody found mainly in coeliac disease", "Highly specific antibody found mainly in hepatitis patients"],
  ["Prozone effect", "Excess antibody giving a false negative result", "Excess antigen giving a false positive result", "Low temperature causing false agglutination", "Contamination causing false haemolysis"],
  ["VDRL test", "Non-treponemal flocculation test for syphilis", "Confirmatory treponemal test for late syphilis cases", "Screening serology test used for HIV infection in adults", "Screening serology test used for hepatitis B infection"],
  ["TPHA", "Treponemal test that confirms syphilis", "Non-treponemal screening test for syphilis", "Screening serology test for HIV infection", "Agglutination serology test for typhoid"],
  ["Mantoux test", "Skin test reflecting delayed hypersensitivity to TB", "Blood test detecting circulating antibodies to TB bacilli", "Sputum culture used to grow TB bacilli on slopes", "Chest film finding that suggests active TB disease"],
  ["Xpert MTB/RIF", "Detects TB DNA and rifampicin resistance", "Stains acid-fast bacilli in sputum smears", "Cultures TB on egg-based medium", "Detects antibodies to TB in serum"],
  ["Flow cytometry", "Counts cells using lasers and labelled antibodies", "Stains tissue sections for routine light microscopy", "Separates proteins by gel electrophoresis in a tank", "Cultures bacteria on solid media in the incubator"],
  ["Complement C3 in immune complex disease", "Often low because it is consumed", "Often raised as an acute-phase reactant", "Normal because it is not involved", "Absent because of a genetic defect"],
  ["Hepatitis A", "Faecal-oral virus, IgM marks acute infection", "Blood-borne DNA virus that often becomes chronic", "Blood-borne RNA virus that often becomes chronic", "Defective virus that needs hepatitis B to replicate"],
  ["Hepatitis C", "RNA virus, often chronic; anti-HCV and PCR", "DNA virus spread by the faecal-oral route", "Vaccine-preventable virus of the liver", "Defective virus needing hepatitis A"],
  ["Hepatitis D", "Defective virus needing hepatitis B to replicate", "Faecal-oral virus for which a vaccine exists now", "Virus prevented by the hepatitis A vaccine in children", "DNA virus that is able to replicate on its own"],
  ["Negri bodies", "Inclusions found in rabies-infected neurons", "Inclusions found in CMV-infected epithelial cells", "Inclusions found in HIV-infected helper T cells", "Inclusions found in malaria-infected red cells"],
  ["Owl-eye inclusions", "Characteristic of cytomegalovirus", "Characteristic of rabies virus", "Characteristic of measles virus", "Characteristic of HIV infection"],

  // ---------- BLOOD BANKING ----------
  ["Landsteiner's rule", "People have antibodies against ABO antigens they lack", "People have antibodies against all of the ABO antigens", "ABO antibodies are present only after a transfusion", "Rh antibodies are naturally occurring from birth"],
  ["Bombay phenotype", "Lacks H antigen, looks group O, has anti-H", "Lacks all Rh antigens on the surface of the red cells", "Lacks Duffy antigens on the surface of the red cells", "Has only weak A antigen on the surface of red cells"],
  ["Universal red cell donor", "Group O negative", "Group AB positive", "Group A negative", "Group B positive"],
  ["Universal plasma donor", "Group AB", "Group O", "Group A", "Group B"],
  ["Anti-D immunoglobulin", "Prevents Rh sensitisation in D-negative mothers", "Treats ABO incompatibility in newborn babies at birth", "Treats bleeding in patients with haemophilia A or B", "Replaces missing clotting factors in liver disease"],
  ["Haemolytic disease of the newborn", "Maternal IgG attacking fetal red cells", "Fetal antibody attacking the mother", "IgM crossing the placenta", "Bacterial infection of the newborn"],
  ["Kleihauer-Betke test", "Quantifies fetal cells in maternal blood", "Identifies the ABO group of the donor", "Detects antibodies in patient serum", "Counts platelets in citrated blood"],
  ["Weak D", "Reduced D expression, found by IAT", "Complete absence of the D antigen", "Unusually strong D expression", "Anti-D antibody present in plasma"],
  ["Antibody screen", "Detects unexpected antibodies with reagent cells", "Identifies the ABO group of the donor unit used", "Counts the white cells in the sample before storage", "Measures the haemoglobin of the patient before transfusion"],
  ["Acute haemolytic transfusion reaction", "Often ABO incompatibility, intravascular haemolysis", "Mild fever from cytokines accumulated in stored units", "Delayed reaction appearing a week or two after transfusion", "Allergic urticaria without any evidence of haemolysis"],
  ["TRALI", "Acute lung injury within 6 hours", "Fluid overload from rapid infusion", "Delayed haemolysis after days", "Iron overload after many units"],
  ["Cryoprecipitate", "Rich in fibrinogen, FVIII, vWF and FXIII", "Rich in platelets and platelet factors", "Rich in red cells and haemoglobin", "Rich in albumin and immunoglobulins"],
  ["Fresh frozen plasma", "Contains all the clotting factors", "Contains functional platelets", "Contains red cells and haemoglobin", "Contains albumin only"],
  ["Platelet storage", "20–24 °C with continuous agitation", "2–6 °C in the blood bank refrigerator without agitation", "−18 °C in a standard freezer without any agitation", "37 °C in a water bath with gentle rocking"],
  ["Red cell storage", "2–6 °C", "20–24 °C with agitation", "−30 °C", "37 °C"],
  ["Cold agglutinin", "IgM antibody reacting best near 4 °C", "IgG antibody reacting best at 37 °C", "IgE antibody found in allergy", "IgA antibody found in secretions"],
  ["Duffy-negative phenotype", "Resistance to P. vivax invasion", "Resistance to P. falciparum invasion in red cells", "Resistance to HIV entry into helper T cells", "Resistance to typhoid fever in endemic regions"],
  ["Kell antigen", "Highly immunogenic red cell antigen", "Antigen present on platelets only", "Antigen that is part of ABO", "Weakly immunogenic antigen"],
  ["Rh antigen D", "Most immunogenic Rh antigen", "Least immunogenic Rh antigen", "Part of the ABO system", "Found only on platelets"],

  // ---------- HISTOLOGY & CYTOLOGY ----------
  ["10% neutral buffered formalin", "Most common routine tissue fixative", "Routine nuclear stain for sections", "Acid used to decalcify bone", "Solvent used to clear tissue"],
  ["Decalcification", "Removal of calcium from bone before cutting", "Removal of lipid from tissue before cutting sections", "Removal of water from tissue before wax embedding", "Removal of pigment from tissue before staining sections"],
  ["Haematoxylin", "Stains nuclei blue-purple", "Stains cytoplasm and collagen pink-red", "Stains collagen green in trichrome methods", "Stains fat red in frozen sections"],
  ["Eosin", "Stains cytoplasm and collagen pink", "Stains nuclei blue-purple", "Stains fat red in frozen sections", "Stains iron deposits blue"],
  ["Papanicolaou stain", "Standard stain for cervical cytology", "Standard stain for acid-fast bacilli", "Standard stain for tissue iron", "Standard stain for amyloid"],
  ["Tissue processing order", "Fix, dehydrate, clear, infiltrate, embed", "Embed, fix, clear, then stain the section with dyes", "Stain, fix, then embed the tissue block in wax", "Clear, fix, dehydrate, then stain and mount the slide"],
  ["Xylene", "Common clearing agent", "Common fixative", "Common stain", "Common decalcifier"],
  ["Microtome", "Cuts thin sections of embedded tissue", "Spins tubes to separate components", "Counts cells in a chamber", "Sterilises equipment with steam"],
  ["Frozen section", "Rapid intra-operative diagnosis on frozen tissue", "Section cut from paraffin blocks stored for years only", "Section prepared for bacterial culture from tissue samples", "Section prepared for a blood film from a marrow aspirate"],
  ["Immunohistochemistry", "Detects tissue antigens with labelled antibodies", "Stains tissue with haematoxylin alone to show nuclei only", "Cultures tissue in a nutrient broth before microscopy", "Fixes tissue in formalin before processing in the lab"],
  ["Masson's trichrome", "Stains collagen blue or green", "Stains iron deposits blue in tissue sections", "Stains amyloid red under polarised light", "Stains lipid orange-red in frozen sections"],
  ["Congo red", "Stains amyloid, apple-green under polarised light", "Stains iron deposits blue with potassium ferrocyanide", "Stains collagen bright green in trichrome methods", "Stains lipid orange-red in frozen sections only"],
  ["Von Kossa stain", "Demonstrates calcium deposits", "Demonstrates iron deposits", "Demonstrates amyloid deposits", "Demonstrates glycogen deposits"],
  ["Reticulin stain", "Silver impregnation of reticular fibres", "Demonstrates calcium deposits as black granules in tissue", "Demonstrates iron deposits as blue granules in tissue", "Demonstrates amyloid deposits as red material in tissue"],
  ["Oil Red O", "Stains fat, needs frozen sections", "Stains iron, needs paraffin sections", "Stains collagen, needs paraffin sections", "Stains amyloid, needs paraffin sections"],
  ["Koilocytes", "Cells with perinuclear halos, HPV effect", "Cells containing needle-like Auer rods", "Cells with Reed-Sternberg nuclear features", "Cells containing ingested red cells"],
  ["Metaplasia", "Reversible replacement of one mature cell type", "Irreversible uncontrolled cell proliferation", "Increase in the number of cells", "Increase in the size of cells"],
  ["Dysplasia", "Disordered cell growth with abnormal maturation", "Replacement of one adult cell type by another", "Cell death", "Increase in organ size"],
  ["Anaplasia", "Loss of differentiation, a feature of malignancy", "Increase in the size of the cells in an organ", "Increase in the number of cells in an organ", "Reversible adaptation to chronic stress in a tissue"],
  ["Hyperplasia", "Increase in the number of cells", "Increase in the size of cells", "Decrease in cell size", "Replacement of cell type"],
  ["Hypertrophy", "Increase in the size of cells", "Increase in the number of cells", "Decrease in cell number", "Loss of differentiation"],
  ["Apoptosis", "Programmed cell death without inflammation", "Cell death from injury with inflammation", "Cell division", "Cell differentiation"],
  ["Coagulative necrosis", "Typical of ischaemic infarcts such as the heart", "Typical of brain infarcts, with liquefaction of tissue", "Typical of tuberculosis, with cheese-like appearance", "Typical of acute pancreatitis, with chalky fat deposits"],
  ["Caseous necrosis", "Cheese-like necrosis typical of tuberculosis", "Typical of heart infarction, firm and pale", "Typical of brain infarction, liquefied", "Typical of fat necrosis, chalky"],
  ["Fine needle aspiration cytology", "Samples cells through a thin needle", "Excises the whole lump for histology", "Draws blood for culture bottles", "Takes bone marrow with a trephine"],
  ["Barr body", "Inactivated X chromosome in female cells", "Y chromosome fluorescing in male cells", "Viral inclusion in infected nuclei", "Nuclear fragment in a red cell"],

  // ---------- PRE-ANALYTICS & SAFETY ----------
  ["Order of draw", "Culture, citrate, serum, heparin, EDTA, fluoride", "EDTA, citrate, serum, heparin, fluoride, culture", "Serum, EDTA, heparin, citrate, culture, fluoride", "Fluoride, EDTA, heparin, serum, citrate, culture"],
  ["Grey-top tube", "Sodium fluoride and oxalate for glucose", "EDTA additive used for haematology", "Citrate additive used for coagulation", "Heparin additive used for chemistry"],
  ["Green-top tube", "Contains heparin", "Contains EDTA", "Contains citrate", "Contains fluoride"],
  ["Prolonged tourniquet", "Causes haemoconcentration, falsely high analytes", "Dilutes the sample, lowering analytes in the tube", "Lowers potassium by driving it into the cells", "Prevents the sample from clotting in the tube"],
  ["Citrate tube ratio", "Nine parts blood to one part citrate", "One part blood to nine parts citrate", "Equal parts blood and citrate", "Five parts blood to one part citrate"],
  ["Glucose in a standing sample", "Falls through glycolysis in red cells", "Rises as cells release stored sugar", "Stays constant for 24 hours", "Converts into ketone bodies"],
  ["Refrigerating whole blood before separation", "Raises potassium by blocking the sodium pump", "Lowers potassium by speeding uptake into the cells", "Raises sodium by causing the red cells to shrink", "Prevents all haemolysis from occurring in the tube"],
  ["Light-sensitive analyte", "Bilirubin", "Sodium", "Creatinine", "Urea"],
  ["Needlestick injury first aid", "Wash with soap and water, report for PEP", "Squeeze hard and suck out the wound to remove blood", "Apply bleach directly to the wound to disinfect it", "Ignore it if no blood is visible on the needle"],
  ["Blood spill disinfection", "Cover with 0.5% hypochlorite and wait", "Wipe with plain water only and dry with a cloth", "Pour 70% ethanol and leave it to evaporate", "Cover with dry paper towel and discard in a bin"],
  ["Biosafety level 2", "Moderate-risk agents such as HBV and Salmonella", "Airborne lethal agents needing maximum containment", "Agents with no known hazard to people", "Chemical hazards with no biological risk"],
  ["Sharps container", "Puncture-resistant bin for needles and blades", "Autoclave bag used for all kinds of laboratory waste", "Bin used for broken glass and plastic tubes only", "Bin used for liquid chemicals and reagent bottles"],
  ["Hand hygiene moment", "Before and after patient contact, after gloves", "Only before going to lunch or leaving the ward", "Only after leaving the laboratory for the day", "Only when the hands look visibly dirty or sticky"],
  ["Specimen rejection reason", "Unlabelled or mislabelled tube", "Slightly late arrival of routine serum", "Different tube brand", "Fasting patient"],
  ["Two patient identifiers", "Full name plus date of birth or ID number", "Ward name plus bed number of the patient only", "Name of the requesting doctor and their department", "Time of collection and the type of tube used"],
  ["Haemolysis index", "Estimates free haemoglobin in serum", "Estimates lipid content in serum", "Estimates bilirubin content in serum", "Estimates clot formation in plasma"],
  ["Order of capillary collection", "EDTA first to prevent platelet clumping", "Serum tubes first to avoid clotting", "Citrate tubes first to avoid dilution", "No order matters at all"],
  ["Angle for venipuncture", "About 15–30 degrees", "90 degrees", "45 to 60 degrees", "Parallel to the skin"],
  ["Fasting sample for glucose", "At least 8 hours without food", "Two hours without any food", "Thirty minutes without any food", "No fasting is ever needed"],
  ["Blood culture before antibiotics", "Raises the yield of positive cultures", "Lowers the yield of positive cultures", "Has no effect on culture results", "Is not recommended by laboratories"],
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