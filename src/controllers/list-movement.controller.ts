import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { number, z } from "zod";

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)

type PageQueryParamsSchema = z.infer<typeof pageQueryParamsSchema>


@Controller('/cashier/:id/movement')
@UseGuards(JwtAuthGuard)
export class ListMovementController {
  constructor(private prisma: PrismaService){}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema,
    @Param() params,
  ) {
    const perPage = 5
    const cashierId = params.id
    

    const movements = await this.prisma.movement.findMany({
      where: {
        cashierId,
      },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { 
        created_at: 'desc'
      } 
    })

    return {
      movements
    }

  }
}