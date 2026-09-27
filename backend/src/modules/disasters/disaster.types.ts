import { Disaster, DisasterStatus, Role, Resource, ResourceType } from '@prisma/client';
import { CreateDisasterInput, UpdateDisasterInput, DisasterQueryInput, ResourceQueryInput } from './disaster.schema.js';

export type { Disaster, DisasterStatus, Role, Resource, ResourceType };
export type { CreateDisasterInput, UpdateDisasterInput, DisasterQueryInput, ResourceQueryInput };

export interface DisasterResponseDto {
  id: string;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  status: DisasterStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceWithDistance extends Resource {
  distanceKm: number;
}
