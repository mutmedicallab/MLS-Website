import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";
import { getCurrentPeriodId } from "../utils/periodId";

const WEEK_ID = getCurrentPeriodId(2);
const QUESTIONS_PER_ATTEMPT = 5;
const SEEN_KEY = "mutmlsa_quiz_seen";

// Each entry: [question, correct answer, wrong 1, wrong 2, wrong 3]
// Answer order is shuffled every time a quiz starts, so position never gives the answer away.
const QUESTION_POOL = [
  // ---------- HAEMATOLOGY ----------
  ["A 30-year-old woman has Hb 8.5 g/dL, MCV 68 fL, a high RDW and a low serum ferritin. What is the most likely diagnosis?", "Iron deficiency anaemia", "Beta-thalassaemia trait", "Megaloblastic anaemia", "Aplastic anaemia"],
  ["A 55-year-old strict vegan has Hb 7 g/dL, MCV 118 fL, hypersegmented neutrophils and tingling in the feet. Which deficiency is most likely?", "Vitamin B12", "Iron", "Vitamin K", "Vitamin C"],
  ["A child with sickle cell disease has Howell-Jolly bodies on the blood film. What do they most strongly suggest?", "Functional hyposplenism from repeated splenic infarcts", "Lead poisoning with basophilic stippling in marrow cells", "Iron overload from repeated transfusions", "Active falciparum malaria with high parasitaemia"],
  ["A patient given primaquine develops dark urine. A supravital stain shows Heinz bodies and the film has bite cells. What is the likely cause?", "G6PD deficiency", "Hereditary spherocytosis", "Autoimmune haemolytic anaemia", "Aplastic anaemia"],
  ["A well 62-year-old has a lymphocyte count of 80 × 10⁹/L and many smudge cells on the film. What is the most likely diagnosis?", "Chronic lymphocytic leukaemia", "Infectious mononucleosis", "Acute lymphoblastic leukaemia", "Chronic myeloid leukaemia"],
  ["A 6-year-old has a white count of 120 × 10⁹/L. Blasts are TdT and CD10 positive and MPO negative. What is the likely diagnosis?", "B-cell acute lymphoblastic leukaemia", "Acute myeloid leukaemia with Auer rods", "Chronic myeloid leukaemia in chronic phase", "Hairy cell leukaemia with TRAP-positive cells"],
  ["An adult has pancytopenia, 80% blasts with Auer rods in bundles, and DIC. Which translocation is characteristic?", "t(15;17) PML-RARA", "t(9;22) BCR-ABL1", "t(14;18) BCL2-IGH", "t(11;14) CCND1-IGH"],
  ["A 58-year-old has splenomegaly, WBC 150 × 10⁹/L with all stages of granulocytes, basophilia and a low LAP score. Which test confirms the diagnosis?", "BCR-ABL1 by PCR or FISH", "JAK2 V617F only", "Flow cytometry for TdT", "Direct antiglobulin test"],
  ["A patient bleeds after a tooth extraction. The aPTT is prolonged, PT and platelets are normal. Which is the most likely cause?", "Deficiency of an intrinsic pathway factor such as VIII or IX", "Factor VII deficiency, which prolongs the PT", "Immune thrombocytopenia with a low platelet count", "Warfarin overdose, which prolongs the PT and INR"],
  ["A patient with early liver disease and poor diet has an isolated prolonged PT. Which clotting factor falls first because of its short half-life?", "Factor VII", "Factor VIII", "Factor X", "Fibrinogen"],
  ["An analyser reports platelets 40 × 10⁹/L in an asymptomatic patient, but the film shows platelet clumps. What is the best next step?", "Recollect in a sodium citrate tube and correct for dilution", "Transfuse platelets at once to prevent spontaneous bleeding", "Report the count as a critical result to the ward", "Start high-dose steroids for immune thrombocytopenia"],
  ["An analyser gives a low red cell count, very high MCV and high MCHC, and the sample agglutinates at room temperature. What should you do?", "Warm the sample to 37 °C and re-run", "Add more EDTA to the tube to stop the clumping", "Dilute with distilled water and re-run on the analyser", "Report the values as normal without any comment"],
  ["A day-1 jaundiced baby (group A positive) is born to a group O positive mother. The DAT is weakly positive. What is the most likely diagnosis?", "ABO haemolytic disease of the newborn", "Rh haemolytic disease of the newborn", "G6PD deficiency", "Physiological jaundice"],
  ["A child who chews old painted furniture has microcytosis and basophilic stippling. Which test should be requested?", "Blood lead level", "Serum B12", "Haemoglobin electrophoresis", "Direct antiglobulin test"],
  ["A patient on heparin has platelets that fall from 250 to 70 × 10⁹/L after 7 days, and develops a new clot. What is the likely diagnosis?", "Heparin-induced thrombocytopenia", "Immune thrombocytopenia with antiplatelet antibodies", "Hereditary spherocytosis with a membrane defect", "Vitamin K deficiency with a prolonged PT"],
  ["A child with bloody diarrhoea develops anaemia with schistocytes, platelets of 20 × 10⁹/L and a raised creatinine. What is the likely diagnosis?", "Haemolytic uraemic syndrome", "Immune thrombocytopenia", "Aplastic anaemia", "Hereditary spherocytosis"],
  ["A blood film shows target cells and hypochromic microcytes. Serum ferritin is normal and the red cell count is high. What is most likely?", "Beta-thalassaemia trait", "Iron deficiency anaemia", "Anaemia of chronic disease", "Pernicious anaemia"],

  // ---------- CLINICAL CHEMISTRY ----------
  ["A 45-year-old has fasting plasma glucose of 7.8 mmol/L on two separate days. How is this interpreted?", "Meets the criteria for diabetes mellitus", "Normal fasting glucose that needs no follow-up", "Impaired fasting glucose only, not diabetes", "Gestational diabetes mellitus in a non-pregnant adult"],
  ["A patient with DKA has pH 7.28, low pCO₂ and low bicarbonate. What is the acid-base picture?", "Metabolic acidosis with respiratory compensation", "Respiratory acidosis with renal compensation over days", "Metabolic alkalosis from vomiting and volume loss", "Respiratory alkalosis from hyperventilation and anxiety"],
  ["A patient has Na 140, Cl 100 and HCO₃ 10 mmol/L. What is the anion gap and its meaning?", "30 mmol/L, raised", "10 mmol/L, normal", "50 mmol/L, lowered", "−30 mmol/L, raised"],
  ["A pink serum sample gives K⁺ 7.1 mmol/L in an asymptomatic patient with a normal ECG. What is the most likely explanation?", "Haemolysis causing pseudohyperkalaemia; recollect", "True hyperkalaemia needing urgent treatment at once", "Renal tubular acidosis with a persistently high potassium", "Hypoaldosteronism with salt wasting and acidosis"],
  ["A patient has ALT 25 U/L, ALP 600 U/L, GGT 400 U/L and raised conjugated bilirubin. What pattern is this?", "Obstructive (cholestatic) pattern", "Hepatocellular pattern", "Pre-hepatic haemolytic pattern", "Normal pattern"],
  ["Which cardiac marker would still be raised 7–10 days after a myocardial infarction?", "Troponin", "CK-MB", "Myoglobin", "AST"],
  ["A woman has TSH 15 mIU/L, a low free T4 and positive anti-TPO antibodies. What is the diagnosis?", "Hashimoto thyroiditis (primary hypothyroidism)", "Graves disease with suppressed TSH and a raised free T4", "TSH-secreting pituitary adenoma with a raised free T4", "Sick euthyroid syndrome during acute illness"],
  ["A patient has total calcium 1.8 mmol/L and albumin 20 g/L. What is the corrected calcium and its meaning?", "About 2.2 mmol/L, normal", "About 1.4 mmol/L, low", "About 2.6 mmol/L, high", "1.8 mmol/L, low"],
  ["A dehydrated patient has creatinine 250 µmol/L and a disproportionately raised urea. Which cause is most likely?", "Pre-renal azotaemia", "Post-renal obstruction only", "Liver failure", "Glomerulonephritis"],
  ["A patient has total cholesterol 6.2, HDL 1.2 and triglycerides 2.2 mmol/L. What is the Friedewald LDL?", "4.0 mmol/L", "5.0 mmol/L", "3.0 mmol/L", "6.2 mmol/L"],
  ["A patient has raised unconjugated bilirubin, increased urine urobilinogen and no bilirubin in urine. What type of jaundice is this?", "Haemolytic (pre-hepatic)", "Obstructive jaundice from gallstones in the bile duct", "Hepatocellular jaundice from viral hepatitis damage", "Biliary atresia in a newborn baby with pale stools"],
  ["Serum shows K⁺ 9.5 mmol/L, Ca²⁺ 0.8 mmol/L and a very low ALP. What is the most likely cause?", "K₂EDTA contamination from wrong order of draw", "Haemolysis only, with a falsely high potassium result", "Renal failure with a true raised potassium level", "Hyperparathyroidism with high calcium and low phosphate"],
  ["A glucose of 1.2 mmol/L is reported in a well-looking patient. The plain tube stood unspun for 6 hours. What is the likely explanation?", "Glycolysis by blood cells; recollect in a fluoride tube", "Insulinoma causing true hypoglycaemia in the patient", "Adrenal insufficiency causing a true low glucose level", "Liver failure causing impaired glucose release by the liver"],
  ["A patient has Na 128 mmol/L, a low serum osmolality, and is euvolaemic with high urine osmolality. Which condition fits best?", "SIADH", "Diabetes insipidus", "Primary polydipsia", "Addison's disease with hypovolaemia"],
  ["Which result pattern best fits diabetic ketoacidosis?", "High glucose, ketones in urine, low bicarbonate", "Low glucose, ketones in urine, high bicarbonate", "High glucose, no ketones, high bicarbonate", "Normal glucose, glucose in urine, normal pH"],

  // ---------- MICROBIOLOGY ----------
  ["A sputum smear from a patient with night sweats shows red rods on a blue background after Ziehl-Neelsen. How should this be reported?", "Acid-fast bacilli seen; grade the smear and send for Xpert or culture", "Gram-negative bacilli seen, so report as probable enteric infection", "Gram-positive cocci seen, so report as probable staphylococci", "No organisms seen, so report the smear as negative"],
  ["A non-lactose fermenter with swarming growth on blood agar is urease and H₂S positive. What is the organism?", "Proteus mirabilis", "Escherichia coli", "Klebsiella pneumoniae", "Pseudomonas aeruginosa"],
  ["CSF from a child is turbid and the Gram stain shows Gram-negative diplococci. What is the likely organism?", "Neisseria meningitidis", "Streptococcus pneumoniae", "Haemophilus influenzae", "Listeria monocytogenes"],
  ["CSF from an HIV patient shows encapsulated budding yeast on India ink. What is the likely organism?", "Cryptococcus neoformans", "Candida albicans", "Histoplasma capsulatum", "Aspergillus fumigatus"],
  ["During a cholera outbreak, which enrichment medium is best for stool samples?", "Alkaline peptone water", "Selenite F broth", "MacConkey broth", "Thioglycollate broth"],
  ["Gram-positive cocci in clusters, coagulase negative, grow in only one of two blood culture sets from a well patient. What is the most likely interpretation?", "Skin contaminant", "True bacteraemia needing urgent treatment", "Endocarditis", "Laboratory error in Gram stain"],
  ["Beta-haemolytic colonies from a throat swab are catalase negative, bacitracin sensitive and PYR positive. What is the organism?", "Streptococcus pyogenes", "Streptococcus agalactiae", "Enterococcus faecalis", "Staphylococcus aureus"],
  ["A neonate with sepsis grows beta-haemolytic, catalase-negative cocci that are CAMP positive. What is the organism?", "Streptococcus agalactiae", "Streptococcus pyogenes", "Streptococcus pneumoniae", "Staphylococcus aureus"],
  ["Urethral pus shows Gram-negative intracellular diplococci that grow on Thayer-Martin, are oxidase positive and ferment glucose only. What is the organism?", "Neisseria gonorrhoeae", "Moraxella catarrhalis", "Chlamydia trachomatis", "Trichomonas vaginalis"],
  ["A Staphylococcus aureus isolate is resistant to the cefoxitin disk. What does this indicate?", "MRSA, so report resistance to all beta-lactams", "Penicillinase production only, so treat with amoxicillin-clavulanate", "Vancomycin resistance mediated by the vanA gene cluster", "A fully susceptible strain that needs no further testing"],
  ["The indicator tape does not change colour after an autoclave cycle. What should you do?", "Do not use the load; investigate and repeat the cycle", "Use the load because the indicator tape is unreliable", "Use the load but add a label to show doubt", "Use the load for non-sterile bench work only"],
  ["A Mueller-Hinton plate is inoculated with a suspension much heavier than 0.5 McFarland. What is the effect on disk diffusion?", "Smaller zones, so isolates look falsely resistant", "Larger zones, so isolates look falsely susceptible", "No effect on zone size", "Irregular zones only"],
  ["A single Widal test shows TO 1:160 and TH 1:160 in a patient from a typhoid-endemic area. What is the best interpretation?", "Not diagnostic alone; confirm with blood culture or a rising titre", "Diagnostic of typhoid, so start treatment on this result alone", "Rules out typhoid because the titre is not above 1:320", "Indicates typhoid vaccination only, never active infection"],
  ["A sputum Gram stain shows more than 25 neutrophils and fewer than 10 squamous epithelial cells per low-power field. What does this mean?", "Good-quality lower respiratory specimen", "Saliva contamination, so the specimen should be rejected", "Insufficient specimen, so ask the patient to cough again", "Specimen is suitable only for fungal culture requests"],
  ["A colony is oxidase positive, produces a blue-green pigment and a grape-like smell. What is the organism?", "Pseudomonas aeruginosa", "Escherichia coli", "Klebsiella pneumoniae", "Acinetobacter baumannii"],
  ["A heavy growth of lactose-fermenting mucoid colonies is non-motile, indole negative and citrate positive. What is the organism?", "Klebsiella pneumoniae", "Escherichia coli, an indole-positive and motile organism", "Salmonella Typhi, a non-lactose fermenter in the gut", "Shigella sonnei, a non-motile late lactose fermenter"],
  ["A child has a grey membrane in the throat. Albert's stain of a swab shows green rods with blue-black granules. What is the organism?", "Corynebacterium diphtheriae", "Streptococcus pyogenes, seen as chains of cocci", "Bordetella pertussis, seen as tiny Gram-negative rods", "Haemophilus influenzae, seen as small pleomorphic rods"],
  ["A wound swab grows Gram-positive spore-forming rods anaerobically from a deep penetrating wound with muscle necrosis. Which organism is suspected?", "Clostridium perfringens", "Staphylococcus aureus", "Escherichia coli", "Listeria monocytogenes"],

  // ---------- PARASITOLOGY ----------
  ["A thin film shows enlarged red cells with Schüffner's dots and amoeboid trophozoites. Which species is likely?", "Plasmodium vivax or P. ovale", "Plasmodium falciparum with multiple small rings in cells", "Plasmodium malariae with band forms in small red cells", "Plasmodium knowlesi with a 24-hour asexual cycle"],
  ["A stool sample shows a bile-stained golden-brown egg with a thick mamillated shell. What is the parasite?", "Ascaris lumbricoides (fertilised egg)", "Trichuris trichiura, with barrel-shaped plugged eggs", "Hookworm, with a thin-shelled egg and a few cells", "Enterobius vermicularis, with a flat-sided embryonated egg"],
  ["A child has night-time perianal itching. Which specimen is best for diagnosis?", "Perianal cellophane tape swab in the morning", "A single stool sample collected at midday on any day", "A thick blood film taken during a night fever spike", "A midstream urine sample sent for culture the next day"],
  ["Why must stool for hookworm eggs be examined fresh?", "Eggs hatch into larvae that may be mistaken for Strongyloides", "Eggs dissolve quickly in air and cannot be identified later", "Eggs turn into cysts when left standing at room temperature", "Eggs become acid-fast and appear red on a ZN smear"],
  ["A man from Lake Victoria has blood in his urine. Which collection gives the best chance of finding Schistosoma haematobium eggs?", "Terminal urine collected around midday", "First morning urine only, because eggs are shed overnight", "An evening random sample after a heavy meal", "A stool sample processed by the formol-ether method"],
  ["An HIV-positive patient has chronic watery diarrhoea. Modified ZN shows pink-red round oocysts of 4–6 µm. What is the parasite?", "Cryptosporidium", "Giardia lamblia", "Entamoeba histolytica", "Strongyloides stercoralis"],
  ["A night blood film shows sheathed microfilariae whose tail tip is free of nuclei. What is the species?", "Wuchereria bancrofti", "Brugia malayi", "Loa loa", "Onchocerca volvulus"],
  ["Why is CSF examined in a patient with confirmed sleeping sickness?", "To stage the disease and choose treatment", "To diagnose malaria co-infection by examining the fluid", "To culture the parasite on blood agar in the laboratory", "To count platelets and white cells for the full blood count"],
  ["A vaginal wet mount shows pear-shaped organisms with jerky motility. What is the organism?", "Trichomonas vaginalis", "Candida albicans", "Gardnerella vaginalis", "Entamoeba histolytica"],
  ["A thick film shows 40 parasites per 200 white cells. The white count is 8000/µL. What is the parasite density?", "1,600 parasites/µL", "3,200 parasites/µL", "200 parasites/µL", "40,000 parasites/µL"],
  ["A spleen aspirate shows amastigotes with a kinetoplast inside macrophages. What is the organism?", "Leishmania donovani", "Plasmodium vivax", "Toxoplasma gondii", "Histoplasma capsulatum"],
  ["Skin snips from a patient living near a fast-flowing river show unsheathed microfilariae. What is the parasite?", "Onchocerca volvulus", "Loa loa", "Wuchereria bancrofti", "Mansonella perstans"],
  ["A film shows a banana-shaped gametocyte in a red cell. Which species is this?", "Plasmodium falciparum", "Plasmodium vivax", "Plasmodium malariae", "Plasmodium ovale"],
  ["A stool smear shows cysts with four nuclei and chromatoidal bars with blunt ends. What is the likely organism?", "Entamoeba histolytica or E. dispar", "Giardia lamblia, with pear-shaped trophozoites in stool", "Endolimax nana, a harmless amoeba with small cysts", "Cryptosporidium parvum, with acid-fast oocysts in stool"],
  ["A fresh stool shows oval, thin-shelled colourless eggs with 4–8 cells separated from the shell by a clear space. Which parasite is this?", "Hookworm", "Trichuris trichiura", "Schistosoma mansoni", "Taenia species"],

  // ---------- IMMUNOLOGY & SEROLOGY ----------
  ["In an HIV rapid test algorithm, the first test is reactive but the second is non-reactive. What should be done next?", "Run a tie-breaker test according to the national algorithm", "Report the sample as HIV positive on the first test alone", "Report the sample as HIV negative after the second test", "Discard the sample and ask for a fresh venepuncture"],
  ["A patient has HBsAg positive for more than six months and anti-HBc IgM negative. What is the interpretation?", "Chronic hepatitis B infection", "Acute hepatitis B infection", "Immunity after vaccination", "Past resolved infection"],
  ["A patient is HBsAg negative, anti-HBs positive and anti-HBc negative. What does this show?", "Immunity from vaccination", "Chronic hepatitis B infection with ongoing replication", "Acute hepatitis B infection in the window period", "Occult hepatitis B infection with undetectable surface antigen"],
  ["A very high-titre serum gives a negative latex agglutination test, but a positive result after dilution. What explains this?", "Prozone effect from antibody excess", "Postzone effect from antigen excess", "Cross-reactivity", "Contaminated reagent"],
  ["A pregnant woman with lupus has a positive RPR and a negative TPHA. What is the best interpretation?", "Biological false-positive of the non-treponemal test", "Primary syphilis needing urgent injection of penicillin", "Treated syphilis with a persistent serological scar", "Congenital syphilis in the newborn of this mother"],
  ["A woman with a facial rash and joint pain has a homogeneous ANA pattern and positive anti-dsDNA. What is the likely diagnosis?", "Systemic lupus erythematosus", "Rheumatoid arthritis with a high RF and anti-CCP", "Sjögren syndrome with anti-Ro and anti-La antibodies", "Dermatomyositis with anti-Jo-1 antibodies and muscle weakness"],
  ["What is the usual Mantoux induration threshold for a positive result in an HIV-positive person?", "5 mm", "10 mm", "15 mm", "20 mm"],
  ["An ELISA shows strong colour in every well, including the negative control. What is the most likely cause?", "Insufficient washing or contaminated conjugate", "Conjugate was left out of the assay by mistake", "Serum was too dilute to give a signal in the wells", "Substrate was left out of the colour development step"],
  ["A lateral flow cryptococcal antigen test is positive in an HIV patient with CD4 below 100. What does this mean?", "Cryptococcal antigenaemia needing further evaluation, including lumbar puncture", "Past infection only, so no further action is needed", "A normal finding in an immunosuppressed patient on ART", "Tuberculous meningitis, confirmed by this antigen result"],
  ["A patient is HBsAg positive and HBeAg positive. What does this suggest?", "High viral replication and high infectivity", "Vaccine-induced immunity with no active infection present", "Past resolved infection with full immunity afterwards", "Hepatitis A infection acquired from contaminated food"],
  ["A patient has a positive rheumatoid factor, but the clinician wants a more specific test for rheumatoid arthritis. Which should be requested?", "Anti-CCP antibodies", "ANA", "Anti-dsDNA", "Anti-mitochondrial antibodies"],

  // ---------- BLOOD BANKING ----------
  ["Forward group shows anti-A positive and anti-B negative. Reverse grouping agglutinates both B cells and A1 cells. What is the likely cause?", "A2 subgroup with anti-A1 antibody", "Group O, because both forward reactions would be negative", "Group AB, because the reverse group would be negative", "Rouleaux only, which is removed by saline replacement"],
  ["A standard 300 µg dose of anti-D immunoglobulin covers about how much fetal bleed?", "About 30 mL of fetal whole blood", "About 5 mL of fetal whole blood, and no more than that", "About 100 mL of fetal whole blood, enough for any bleed", "Any amount of fetal bleed, with no upper limit"],
  ["A crossmatch is incompatible only at the antiglobulin phase, and the antibody screen is positive. What is the next step?", "Identify the antibody with a panel; it is likely a clinically significant IgG alloantibody", "Issue the unit anyway because the crossmatch is only weakly positive", "Repeat the ABO group only and then issue the unit", "Discard the sample and report the crossmatch as normal"],
  ["During a transfusion, a patient develops fever, back pain and red urine. What is the first action?", "Stop the transfusion, keep the line open with saline, recheck identity and notify the blood bank", "Slow the transfusion and give paracetamol for the fever", "Continue the transfusion and observe the patient closely", "Switch to another unit of the same group and carry on"],
  ["A unit of platelets was stored at 4 °C overnight. What is the consequence?", "Platelets lose viability and are cleared faster after transfusion", "No effect on the platelets since they tolerate the cold well", "Red cells haemolyse in the unit during cold storage", "Plasma in the unit clots and forms visible strands"],
  ["A female blood donor has a haemoglobin below the minimum threshold. What should be done?", "Defer temporarily and advise on iron", "Accept the donation because the donor looks healthy today", "Accept the donation but only for platelet apheresis", "Accept the donation after she drinks plenty of water"],
  ["A woman of childbearing age needs red cells urgently and her blood group is not yet known. Which red cells should be issued?", "Group O Rh-negative", "Group AB Rh-positive", "Group A Rh-negative", "Group O Rh-positive"],
  ["A group O Rh-negative mother delivers an Rh-positive baby. Which test estimates the dose of anti-D needed?", "Kleihauer-Betke test", "Direct antiglobulin test", "Antibody screen only", "Sickle solubility test"],

  // ---------- HISTOLOGY & CYTOLOGY ----------
  ["What is the recommended volume ratio of fixative to tissue for routine fixation?", "At least 10:1", "At least 1:1, using a small tight container", "At least 2:1, using a shallow tray with a loose lid", "At least 1:10, using a very small volume of fixative"],
  ["Which decalcifier best preserves antigens and DNA for immunohistochemistry on bone?", "EDTA", "Concentrated nitric acid", "Concentrated hydrochloric acid", "Picric acid"],
  ["A liver biopsy is suspected of iron overload. Which stain should be used?", "Perls' Prussian blue", "Congo red", "Periodic acid-Schiff", "Masson's trichrome"],
  ["A kidney biopsy is suspected of amyloidosis. Which stain gives apple-green birefringence under polarised light?", "Congo red", "Perls' Prussian blue", "Sudan black", "Giemsa"],
  ["Tissue sections keep detaching from the slides during staining. Which fix is most appropriate?", "Use adhesive-coated slides such as poly-L-lysine", "Use thicker sections so that they hold on the glass better", "Shorten the fixation time to stop the tissue shrinking", "Skip the dewaxing step so the wax holds the section"],
  ["Holes and vacuoles appear in a frozen section. What is the most likely cause?", "Slow freezing causing ice crystals", "Over-fixation in formalin hardening the tissue too much", "A blunt knife on the cryostat tearing the section", "The wrong stain used for frozen sections of this tissue"],
  ["Air-dried FNAC smears are usually stained with which method?", "May-Grünwald Giemsa or Diff-Quik", "Papanicolaou stain, which is used for wet-fixed smears", "Ziehl-Neelsen stain, which is used for acid-fast bacilli", "Gram stain, which is used for bacteria in smears"],
  ["Haematoxylin and eosin sections look pale with washed-out nuclei. Which is a likely cause?", "Over-differentiation in acid alcohol", "Insufficient fixation time only, with normal staining times", "Sections cut too thick, giving dark nuclei overall", "Excess xylene carried over from the previous change"],
  ["A Pap smear shows cells with perinuclear halos and enlarged irregular nuclei. Which infection is suggested?", "Human papillomavirus", "Candida albicans", "Trichomonas vaginalis", "Herpes simplex virus"],
  ["Which tissue processing sequence is correct?", "Fixation, dehydration, clearing, wax infiltration, embedding", "Fixation, clearing, dehydration, embedding, wax infiltration", "Dehydration, fixation, embedding, clearing, wax infiltration", "Embedding, fixation, dehydration, clearing, wax infiltration"],

  // ---------- PRE-ANALYTICS & QUALITY ----------
  ["Control values have been above the mean for 8 consecutive days. Which type of error does this suggest?", "Systematic error", "Random error only", "A single pipetting error", "No error"],
  ["One control value falls outside ±3 SD while the other controls are in range. What is the best action?", "Reject the run, investigate and repeat after correcting", "Report the patient results and ignore the failed control", "Change the reference range so the control falls in range", "Average all the controls and report the result obtained"],
  ["Potassium is 6.0 mmol/L in a sample delivered 5 hours late, unspun and refrigerated. What is the likely explanation?", "Leakage of potassium from cells in the unspun cold sample", "True hyperkalaemia from kidney failure in this patient", "An analyser calibration error affecting all the potassium results", "Lipaemia interfering with the ion-selective electrode readings"],
  ["Lipaemia in a sample for a full blood count most affects which results?", "Falsely raised haemoglobin and MCHC", "Falsely low haemoglobin and MCHC, and falsely raised platelets", "Falsely low platelets only, with all other values normal", "Lower MCV only, with the rest of the indices unchanged"],
  ["A new reagent lot is introduced. What is the best practice?", "Verify with QC and patient samples against the old lot before use", "Start using it immediately because the lot is from the same supplier", "Use it only after the old lot has expired completely", "Check only the expiry date printed on the box"],
  ["A specimen ID mismatch is discovered after results were released. What is the first action?", "Recall the results, notify the clinician, document and investigate", "Ignore it because the results look normal for this patient", "Edit the label quietly so that the records match the tube", "Wait for the next scheduled audit to raise the problem"],
  ["A potassium of 6.8 mmol/L is a critical result. What is the correct action?", "Notify the clinician immediately with read-back and document it", "Wait until the end of the batch before telling the clinician", "Repeat the test tomorrow on a fresh sample from the ward", "Report it only at the next routine ward round"],
  ["Which sample is most affected by being left in sunlight for several hours before analysis?", "Bilirubin", "Sodium", "Creatinine", "Urea"],
  ["A coagulation tube is underfilled. What is the effect on the PT/aPTT?", "Excess citrate, so results are falsely prolonged", "Results are falsely shortened because of less citrate", "No effect, because the analyser corrects the tube volume", "Clotting factors increase in the underfilled tube"],
  ["Which patient preparation matters most for an accurate fasting lipid profile?", "Fasting for 9–12 hours with water allowed", "Eating a fatty meal before sampling to show real levels", "Heavy exercise just before the sample is taken", "Sampling straight after a blood transfusion"],
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Short stable id for a question, used by the "seen" memory
function qid(entry) {
  let h = 5381;
  const s = entry[0];
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

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

// Pick N questions, preferring ones this device has not seen yet
function pickQuestions(n) {
  const allIds = QUESTION_POOL.map(qid);
  let seen = readSeen().filter((id) => allIds.includes(id));
  const unseen = QUESTION_POOL.filter((e) => !seen.includes(qid(e)));

  let chosen = [];
  if (unseen.length >= n) {
    chosen = shuffle(unseen).slice(0, n);
    seen = [...seen, ...chosen.map(qid)];
  } else {
    // Pool nearly used up: take what's left, reset memory, fill from the rest
    chosen = [...unseen];
    const rest = shuffle(QUESTION_POOL.filter((e) => !chosen.includes(e))).slice(0, n - chosen.length);
    chosen = [...chosen, ...rest];
    seen = rest.map(qid);
  }
  writeSeen(seen);

  // Build playable questions with a freshly shuffled option order
  return shuffle(chosen).map(([prompt, correct, ...wrong]) => {
    const options = shuffle([correct, ...wrong]);
    return { prompt, options, correctIndex: options.indexOf(correct) };
  });
}

export default function Quiz() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    loadPeriods();
  }, []);

  function loadLeaderboard() {
    fetch(`${API_BASE_URL}/api/quiz/leaderboard?week=${encodeURIComponent(WEEK_ID)}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }

  function loadPeriods() {
    fetch(`${API_BASE_URL}/api/quiz/champions-by-period`)
      .then((res) => res.json())
      .then((data) => setPeriods(data.periods || []))
      .catch(() => {});
  }

  async function checkExistingAndStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setChecking(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/quiz/attempt?week=${encodeURIComponent(WEEK_ID)}&name=${encodeURIComponent(name.trim())}`
      );
      const data = await res.json();
      if (data.attempt) {
        setExistingAttempt(data.attempt);
      } else {
        setQuestions(pickQuestions(QUESTIONS_PER_ATTEMPT));
        setStarted(true);
      }
    } finally {
      setChecking(false);
    }
  }

  function selectAnswer(optionIndex) {
    setAnswers((prev) => ({ ...prev, [step]: optionIndex }));
  }

  function nextQuestion() {
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    const score = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const total = questions.length;
    setResult({ score, total });
    setSubmitted(true);

    if (score === total) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }

    try {
      await fetch(`${API_BASE_URL}/api/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: WEEK_ID, name: name.trim(), score, total }),
      });
    } catch {
      /* ignore – leaderboard will simply not update */
    }
    loadLeaderboard();
    loadPeriods();
  }

  const currentQuestion = questions[step];
  const currentAnswer = answers[step];
  const currentLeader = leaderboard[0];

  return (
    <section id="quiz" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">This round's quiz</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Lab Science Quiz
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          {QUESTIONS_PER_ATTEMPT} case-based questions, drawn at random from a large pool, with the
          answers shuffled every time. One attempt per person per round.
        </p>

        {currentLeader && (
          <div className="mt-6 flex items-center justify-between rounded-sm border border-coral-500/30 bg-coral-500/5 px-4 py-3">
            <span className="label-tag text-coral-600">Leading this round</span>
            <span className="text-sm font-semibold text-lab-900 dark:text-dark-ink">
              {currentLeader.name} · {currentLeader.score}/{currentLeader.total}
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
                    {entry.score}/{entry.total}
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
                          {entry.score}/{entry.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!started && !submitted && (
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
                You've already played this round — scored {existingAttempt.score}/
                {existingAttempt.total}. Come back next round for a new one.
              </p>
            )}
          </motion.div>
        )}

        {started && !submitted && currentQuestion && (
          <div className="mt-8">
            <p className="label-tag text-lab-700 dark:text-lab-500">
              Question {step + 1} of {questions.length}
            </p>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
              <motion.div
                className="h-full bg-coral-500"
                animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="mt-5 rounded-sm border border-ink/10 bg-lab-50/50 p-5 dark:border-dark-border dark:bg-dark-surface/40"
              >
                <p className="text-sm text-ink dark:text-dark-ink">{currentQuestion.prompt}</p>

                <div className="mt-4 space-y-2">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = currentAnswer === i;
                    return (
                      <motion.button
                        key={i}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAnswer(i)}
                        className={`block w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-coral-500 bg-coral-500 text-paper"
                            : "border-ink/15 text-ink hover:bg-lab-100/60 dark:border-dark-border dark:text-dark-ink dark:hover:bg-dark-surface/70"
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={nextQuestion}
              disabled={currentAnswer === undefined}
              className="mt-5 rounded-sm bg-lab-800 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40 dark:bg-lab-600"
            >
              {step < questions.length - 1 ? "Next question" : "Finish quiz"}
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {submitted && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="mt-8 rounded-sm border border-ink/10 bg-lab-50/50 p-6 text-center dark:border-dark-border dark:bg-dark-surface/40"
            >
              <p className="font-display text-3xl font-bold text-lab-900 dark:text-dark-ink">
                {result.score}/{result.total}
              </p>
              <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
                {result.score === result.total
                  ? "Perfect score — nicely done."
                  : "Good effort — see the leaderboard above, and try again next round."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}