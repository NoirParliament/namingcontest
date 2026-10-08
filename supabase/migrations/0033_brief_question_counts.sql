-- ============================================================================
-- Brief drop-off, question by question, for every visitor.
--
-- One row per question of every category's brief, in the order the chat asks
-- them, with how many times it was answered (anonymous step counts, 0032).
-- Questions nobody has reached yet show 0, so drop-off is visible across the
-- whole brief. Each row also carries how many briefs were started and
-- finished in that category, for completion rates.
--
-- The question list below is generated from the site's own code
-- (src/utils/v4Brief.js getQuestionsFor + SHARED_SETTINGS_QUESTIONS + the
-- closing intro, with working name and participants first), the same order
-- BriefChat uses. If brief questions change, regenerate this list.
-- Counts are all-time (since counting began on October 8, 2026).
-- ============================================================================

create or replace view reporting.brief_questions as
with q (category_id, tier, question_order, question_id, question) as (
  values
    ('p1', 'personal', 1, 'workingName', 'Working name'),
    ('p1', 'personal', 2, 'voterTier', 'Participants'),
    ('p1', 'personal', 3, 'dueDate', 'Due date'),
    ('p1', 'personal', 4, 'gender', 'Do you know the gender?'),
    ('p1', 'personal', 5, 'lastName', 'Last name (and middle name, if decided)'),
    ('p1', 'personal', 6, 'siblingNames', 'Sibling names'),
    ('p1', 'personal', 7, 'heritage', 'Cultural or heritage context'),
    ('p1', 'personal', 8, 'lengthPref', 'Name length preference'),
    ('p1', 'personal', 9, 'familiarity', 'How familiar should the name be?'),
    ('p1', 'personal', 10, 'personalityPath', 'Personality or path'),
    ('p1', 'personal', 11, 'exploreDirections', 'Directions to explore'),
    ('p1', 'personal', 12, 'avoidDirections', 'Anything to avoid?'),
    ('p1', 'personal', 13, 'namesConsidered', 'Names you''ve considered'),
    ('p1', 'personal', 14, 'customRequirements', 'Custom requirements'),
    ('p1', 'personal', 15, 'anonymity', 'Credit'),
    ('p1', 'personal', 16, 'submissionLimit', 'Submissions per person'),
    ('p1', 'personal', 17, 'submitterPrize', 'Winner prize'),
    ('p1', 'personal', 18, 'schedule', 'Schedule'),
    ('p1', 'personal', 19, 'intro', 'Intro to participants'),
    ('p2', 'personal', 1, 'workingName', 'Working name'),
    ('p2', 'personal', 2, 'voterTier', 'Participants'),
    ('p2', 'personal', 3, 'petType', 'Kind of animal and breed'),
    ('p2', 'personal', 4, 'origin', 'How they came to you'),
    ('p2', 'personal', 5, 'sexAge', 'Sex and age'),
    ('p2', 'personal', 6, 'breed', 'Their look'),
    ('p2', 'personal', 7, 'petPersonality', 'Personality'),
    ('p2', 'personal', 8, 'otherPets', 'Other pets'),
    ('p2', 'personal', 9, 'nameTone', 'Kind of name'),
    ('p2', 'personal', 10, 'quirks', 'Quirks and habits'),
    ('p2', 'personal', 11, 'interests', 'Household interests and inside jokes'),
    ('p2', 'personal', 12, 'admiredNames', 'Pet names you''ve loved'),
    ('p2', 'personal', 13, 'customRequirements', 'Custom requirements'),
    ('p2', 'personal', 14, 'anonymity', 'Credit'),
    ('p2', 'personal', 15, 'submissionLimit', 'Submissions per person'),
    ('p2', 'personal', 16, 'submitterPrize', 'Winner prize'),
    ('p2', 'personal', 17, 'schedule', 'Schedule'),
    ('p2', 'personal', 18, 'intro', 'Intro to participants'),
    ('p4', 'personal', 1, 'workingName', 'Working name'),
    ('p4', 'personal', 2, 'voterTier', 'Participants'),
    ('p4', 'personal', 3, 'projectSummary', 'What are you naming?'),
    ('p4', 'personal', 4, 'purpose', 'What it does, or is for'),
    ('p4', 'personal', 5, 'newOrReplacing', 'New, or replacing a name?'),
    ('p4', 'personal', 6, 'audience', 'Who the name is for'),
    ('p4', 'personal', 7, 'reflect', 'Something the name should reflect'),
    ('p4', 'personal', 8, 'vibe', 'Tone'),
    ('p4', 'personal', 9, 'feeling', 'Feeling it should give'),
    ('p4', 'personal', 10, 'descriptiveEvocative', 'Direct or abstract?'),
    ('p4', 'personal', 11, 'nameTypes', 'Types of names you like or want to avoid'),
    ('p4', 'personal', 12, 'admiredNames', 'Three names you like'),
    ('p4', 'personal', 13, 'dislikedNames', 'Three names you don''t like'),
    ('p4', 'personal', 14, 'avoidNames', 'Off-limits'),
    ('p4', 'personal', 15, 'customRequirements', 'Custom requirements'),
    ('p4', 'personal', 16, 'anonymity', 'Credit'),
    ('p4', 'personal', 17, 'submissionLimit', 'Submissions per person'),
    ('p4', 'personal', 18, 'submitterPrize', 'Winner prize'),
    ('p4', 'personal', 19, 'schedule', 'Schedule'),
    ('p4', 'personal', 20, 'intro', 'Intro to participants'),
    ('t1', 'group', 1, 'workingName', 'Working name'),
    ('t1', 'group', 2, 'voterTier', 'Participants'),
    ('t1', 'group', 3, 'projectSummary', 'About the team'),
    ('t1', 'group', 4, 'based', 'Where you''re based'),
    ('t1', 'group', 5, 'audience', 'Audience for the name'),
    ('t1', 'group', 6, 'localInspiration', 'Local inspiration'),
    ('t1', 'group', 7, 'teamColors', 'Colors or mascot'),
    ('t1', 'group', 8, 'personality', 'Intimidating or playful'),
    ('t1', 'group', 9, 'leagueNames', 'Other teams in your league'),
    ('t1', 'group', 10, 'avoidNames', 'Off-limits'),
    ('t1', 'group', 11, 'admiredNames', 'Three great team names'),
    ('t1', 'group', 12, 'terribleNames', 'Three terrible team names'),
    ('t1', 'group', 13, 'namesConsidered', 'Names proposed and rejected'),
    ('t1', 'group', 14, 'customRequirements', 'Custom requirements'),
    ('t1', 'group', 15, 'anonymity', 'Credit'),
    ('t1', 'group', 16, 'submissionLimit', 'Submissions per person'),
    ('t1', 'group', 17, 'submitterPrize', 'Winner prize'),
    ('t1', 'group', 18, 'schedule', 'Schedule'),
    ('t1', 'group', 19, 'intro', 'Intro to participants'),
    ('t2', 'group', 1, 'workingName', 'Working name'),
    ('t2', 'group', 2, 'voterTier', 'Participants'),
    ('t2', 'group', 3, 'projectSummary', 'About the band or club'),
    ('t2', 'group', 4, 'personalityWords', 'Personality in a few words'),
    ('t2', 'group', 5, 'originStory', 'Origin story'),
    ('t2', 'group', 6, 'localConnection', 'Local connection'),
    ('t2', 'group', 7, 'similarAdmired', 'Similar bands or clubs you admire'),
    ('t2', 'group', 8, 'confusedWith', 'Don''t want to be confused with'),
    ('t2', 'group', 9, 'references', 'References that feel true to you'),
    ('t2', 'group', 10, 'avoidNames', 'Off-limits'),
    ('t2', 'group', 11, 'admiredNames', 'Three names you love'),
    ('t2', 'group', 12, 'namesConsidered', 'Considered and rejected'),
    ('t2', 'group', 13, 'customRequirements', 'Custom requirements'),
    ('t2', 'group', 14, 'anonymity', 'Credit'),
    ('t2', 'group', 15, 'submissionLimit', 'Submissions per person'),
    ('t2', 'group', 16, 'submitterPrize', 'Winner prize'),
    ('t2', 'group', 17, 'schedule', 'Schedule'),
    ('t2', 'group', 18, 'intro', 'Intro to participants'),
    ('t6', 'group', 1, 'workingName', 'Working name'),
    ('t6', 'group', 2, 'voterTier', 'Participants'),
    ('t6', 'group', 3, 'projectSummary', 'What are you naming?'),
    ('t6', 'group', 4, 'purpose', 'What it does, or is for'),
    ('t6', 'group', 5, 'newOrReplacing', 'New, or replacing a name?'),
    ('t6', 'group', 6, 'audience', 'Who the name is for'),
    ('t6', 'group', 7, 'reflect', 'Something the name should reflect'),
    ('t6', 'group', 8, 'vibe', 'Tone'),
    ('t6', 'group', 9, 'feeling', 'Feeling it should give'),
    ('t6', 'group', 10, 'descriptiveEvocative', 'Direct or abstract?'),
    ('t6', 'group', 11, 'nameTypes', 'Types of names you like or want to avoid'),
    ('t6', 'group', 12, 'admiredNames', 'Three names you like'),
    ('t6', 'group', 13, 'dislikedNames', 'Three names you don''t like'),
    ('t6', 'group', 14, 'avoidNames', 'Off-limits'),
    ('t6', 'group', 15, 'customRequirements', 'Custom requirements'),
    ('t6', 'group', 16, 'anonymity', 'Credit'),
    ('t6', 'group', 17, 'submissionLimit', 'Submissions per person'),
    ('t6', 'group', 18, 'submitterPrize', 'Winner prize'),
    ('t6', 'group', 19, 'schedule', 'Schedule'),
    ('t6', 'group', 20, 'intro', 'Intro to participants'),
    ('b1', 'business', 1, 'workingName', 'Working name'),
    ('b1', 'business', 2, 'voterTier', 'Participants'),
    ('b1', 'business', 3, 'namingTarget', 'What are you naming?'),
    ('b1', 'business', 4, 'projectSummary', 'About the company'),
    ('b1', 'business', 5, 'nameCommunicate', 'What should the name communicate?'),
    ('b1', 'business', 6, 'brandPersonality', 'Personality'),
    ('b1', 'business', 7, 'nameStyles', 'Name styles'),
    ('b1', 'business', 8, 'descriptiveEvocative', 'Explain or suggest?'),
    ('b1', 'business', 9, 'otherLanguages', 'Names from other languages?'),
    ('b1', 'business', 10, 'includeAvoid', 'Words or ideas to explore or avoid'),
    ('b1', 'business', 11, 'admiredNames', 'Names you''re drawn to'),
    ('b1', 'business', 12, 'practicalReqs', 'Practical requirements'),
    ('b1', 'business', 13, 'namesConsidered', 'Names considered and rejected'),
    ('b1', 'business', 14, 'customRequirements', 'Custom requirements'),
    ('b1', 'business', 15, 'anonymity', 'Credit'),
    ('b1', 'business', 16, 'submissionLimit', 'Submissions per person'),
    ('b1', 'business', 17, 'submitterPrize', 'Winner prize'),
    ('b1', 'business', 18, 'schedule', 'Schedule'),
    ('b1', 'business', 19, 'intro', 'Intro to participants'),
    ('b2', 'business', 1, 'workingName', 'Working name'),
    ('b2', 'business', 2, 'voterTier', 'Participants'),
    ('b2', 'business', 3, 'projectSummary', 'About the product'),
    ('b2', 'business', 4, 'brandFamily', 'Part of a larger brand or family?'),
    ('b2', 'business', 5, 'productLine', 'Other products in this line?'),
    ('b2', 'business', 6, 'namingConventions', 'Existing naming conventions?'),
    ('b2', 'business', 7, 'pairedWithCompany', 'Paired with the company name?'),
    ('b2', 'business', 8, 'featuresBenefits', 'Features or benefits to convey?'),
    ('b2', 'business', 9, 'nameUsage', 'How will the name appear and be used?'),
    ('b2', 'business', 10, 'nameStyles', 'Name styles'),
    ('b2', 'business', 11, 'descriptiveEvocative', 'Explain or suggest?'),
    ('b2', 'business', 12, 'otherLanguages', 'Names from other languages?'),
    ('b2', 'business', 13, 'includeAvoid', 'Words or ideas to explore or avoid'),
    ('b2', 'business', 14, 'admiredNames', 'Names you''re drawn to'),
    ('b2', 'business', 15, 'namesConsidered', 'Names considered and rejected'),
    ('b2', 'business', 16, 'practicalReqs', 'Practical requirements'),
    ('b2', 'business', 17, 'customRequirements', 'Custom requirements'),
    ('b2', 'business', 18, 'anonymity', 'Credit'),
    ('b2', 'business', 19, 'submissionLimit', 'Submissions per person'),
    ('b2', 'business', 20, 'submitterPrize', 'Winner prize'),
    ('b2', 'business', 21, 'schedule', 'Schedule'),
    ('b2', 'business', 22, 'intro', 'Intro to participants'),
    ('b5', 'business', 1, 'workingName', 'Working name'),
    ('b5', 'business', 2, 'voterTier', 'Participants'),
    ('b5', 'business', 3, 'projectSummary', 'What are you naming?'),
    ('b5', 'business', 4, 'purpose', 'What it does, or is for'),
    ('b5', 'business', 5, 'newOrReplacing', 'New, or replacing a name?'),
    ('b5', 'business', 6, 'audience', 'Who the name is for'),
    ('b5', 'business', 7, 'reflect', 'Something the name should reflect'),
    ('b5', 'business', 8, 'vibe', 'Tone'),
    ('b5', 'business', 9, 'feeling', 'Feeling it should give'),
    ('b5', 'business', 10, 'descriptiveEvocative', 'Direct or abstract?'),
    ('b5', 'business', 11, 'nameTypes', 'Types of names you like or want to avoid'),
    ('b5', 'business', 12, 'admiredNames', 'Three names you like'),
    ('b5', 'business', 13, 'dislikedNames', 'Three names you don''t like'),
    ('b5', 'business', 14, 'avoidNames', 'Off-limits'),
    ('b5', 'business', 15, 'customRequirements', 'Custom requirements'),
    ('b5', 'business', 16, 'anonymity', 'Credit'),
    ('b5', 'business', 17, 'submissionLimit', 'Submissions per person'),
    ('b5', 'business', 18, 'submitterPrize', 'Winner prize'),
    ('b5', 'business', 19, 'schedule', 'Schedule'),
    ('b5', 'business', 20, 'intro', 'Intro to participants')
),
answers as (
  select category_id, question_id, count(*) as n
    from public.funnel_steps
   where step = 'brief_step'
   group by category_id, question_id
),
cats as (
  select category_id,
         count(*) filter (where step = 'category_selected') as started,
         count(*) filter (where step = 'brief_completed')   as finished
    from public.funnel_steps
   group by category_id
)
select
  initcap(q.tier) as tier,
  case q.category_id
    when 'p1' then 'Baby'
    when 'p2' then 'Pet'
    when 'p4' then 'Personal: something else'
    when 't1' then 'Team'
    when 't2' then 'Band or club'
    when 't6' then 'Group: something else'
    when 'b1' then 'Company'
    when 'b2' then 'Product'
    when 'b5' then 'Business: something else'
  end as category,
  q.category_id,
  q.question_order,
  q.question,
  q.question_id,
  coalesce(a.n, 0)        as answered,
  coalesce(c.started, 0)  as category_started,
  coalesce(c.finished, 0) as category_finished
from q
left join answers a on a.category_id = q.category_id and a.question_id = q.question_id
left join cats    c on c.category_id = q.category_id;

comment on view reporting.brief_questions is 'Looker: every brief question per category with anonymous answer counts (all visitors), no personal data.';

grant select on reporting.brief_questions to looker_readonly;
