import type { NextFunction, Request, Response } from "express";
import { calculatePrevailingWage } from "../services/prevailingWage.service.js";
import { prevailingWageSchema } from "../validators/prevailingWage.schema.js";

export function calculateWage(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const input = prevailingWageSchema.parse(request.body);
    const result = calculatePrevailingWage(input);

    response.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
