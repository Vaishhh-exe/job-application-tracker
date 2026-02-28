"use client"

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { FollowUpBadge, FollowUpDot } from "@/components/FollowUpBadge"
import { Application } from "@/types/application"

export interface ApplicationsBoardProps {
  applications: Application[]
  onStatusChange?: (appId: string, newStatus: string, oldStatus: string) => void
  onEdit?: (app: Application) => void
}

const statuses = [
  "applied",
  "interview",
  "offer",
  "rejected",
  "ghosted",
] as const

const statusStyles: Record<typeof statuses[number], string> = {
  applied: "bg-gray-50 dark:bg-gray-800",
  interview: "bg-blue-50 dark:bg-blue-900/30",
  offer: "bg-green-50 dark:bg-green-900/30",
  rejected: "bg-red-50 dark:bg-red-900/30",
  ghosted: "bg-purple-50 dark:bg-purple-900/30",
}

export function ApplicationsBoard({ applications, onStatusChange, onEdit }: ApplicationsBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside a valid droppable
    if (!destination) return

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Status changed - notify parent
    if (destination.droppableId !== source.droppableId && onStatusChange) {
      onStatusChange(draggableId, destination.droppableId, source.droppableId)
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Outer wrapper: prevents page-level horizontal scroll */}
      <div className="w-full overflow-x-auto">
        {/* Board container */}
        <div className="flex gap-6 p-4 min-w-max">
          {statuses.map((status) => {
            const statusApplications = applications.filter(
              (app) => app.status === status
            )

            return (
              <div
                key={status}
                className={`
                  w-70
                  flex flex-col
                  rounded-xl
                  border
                  ${statusStyles[status]}
                  p-4
                `}
              >
                {/* Column header */}
                <div className="mb-4 shrink-0">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-center dark:text-white">
                    {status}
                  </h2>
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                    {statusApplications.length} {statusApplications.length === 1 ? 'app' : 'apps'}
                  </div>
                </div>

                {/* Droppable area */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-16 rounded-lg p-2 transition-colors ${
                        snapshot.isDraggingOver ? "bg-blue-100/50" : ""
                      }`}
                    >
                      {statusApplications.map((app, index) => (
                        <Draggable
                          key={app.id}
                          draggableId={app.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onEdit?.(app)}
                              className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
                                snapshot.isDragging ? "shadow-lg ring-2 ring-blue-400" : ""
                              }`}
                              title="Click to view details"
                            >
                              <div className="flex items-center gap-2 font-semibold dark:text-white">
                                <FollowUpDot followUpDate={app.followUpDate} />
                                {app.company}
                              </div>
                              <div className="text-sm text-muted-foreground dark:text-gray-400">
                                {app.role}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {new Date(app.appliedDate).toLocaleDateString("en-GB")}
                              </div>
                              <FollowUpBadge followUpDate={app.followUpDate} className="mt-2" />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {statusApplications.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">
                          Drop here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </div>
    </DragDropContext>
  )
}
