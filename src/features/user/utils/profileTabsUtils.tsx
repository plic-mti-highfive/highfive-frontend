import { Folder, Users, Heart } from "lucide-react";
import React from "react";

export function createProjectsTabs(params: {
  createdProjects?: React.ReactNode;
  collaborations?: React.ReactNode;
  likedProjects?: React.ReactNode;
}) {
  return [
    {
      id: "created",
      label: "Créés",
      icon: <Folder className="w-4 h-4" />,
      content: params.createdProjects,
    },
    {
      id: "collaborations",
      label: "Collaborations",
      icon: <Users className="w-4 h-4" />,
      content: params.collaborations,
    },
    {
      id: "liked",
      label: "High Fives",
      icon: <Heart className="w-4 h-4" />,
      content: params.likedProjects,
    },
  ];
}
