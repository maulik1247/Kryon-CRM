export const HELP = {
  confidence:
    "Win probability for this deal—not the pipeline stage. 100% Certain, 75% Likely, 50% Possible, 25% Early, 0% Unlikely.",
  pipelineStage:
    "Where the deal sits in your sales process (e.g. Quote, Negotiation). Separate from the confidence % on each deal.",
  stuckDeals:
    "Open deals with no activity for 14+ days. Follow up to keep them from stalling.",
  pipelineValue:
    "Sum of estimated annual value for all open deals (quantity × quoted price).",
  activeLeads:
    "Deals in open pipeline stages—not marked won or lost.",
  myActiveDeals: "Open deals you own—not marked won or lost.",
  myPipelineValue:
    "Total estimated annual value of open deals assigned to you.",
  myOpenTasks: "Tasks assigned to you that are pending or in progress.",
  dueThisWeek:
    "Open tasks due before the end of this week on your deals.",
  attendance:
    "Check in when you start work and check out when you leave. One record per day.",
  taskStatus:
    "Pending = not started. In progress = working on it. Completed = done.",
  doBy: "Target date to finish this task—the next step on the deal.",
  estimatedValue:
    "Estimated annual value = annual quantity × our quoted price per unit.",
  pipelineChart:
    "Number of open deals in each active pipeline stage.",
  startingStage:
    "The pipeline column where this new lead appears first.",
  dealOwner:
    "Sales rep responsible for moving this deal forward.",
  supplierPrice:
    "What the customer pays their current supplier per unit—used for comparison.",
  nextTask:
    "The earliest open task on this deal. Complete it to keep the deal moving.",
} as const;
