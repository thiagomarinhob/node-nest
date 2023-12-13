import { Body, ConflictException, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/current-user-decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UserPayload } from "src/auth/jwt.strategy";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const createMovementBodySchema = z.object({
  type: z.string(),
  value: z.number(),
  description: z.string().optional(),
})

const bodyValidationPipe = new ZodValidationPipe(createMovementBodySchema)

type CreateMovementBodySchema = z.infer<typeof createMovementBodySchema>

@Controller('/cashier/:id/movement')
@UseGuards(JwtAuthGuard)
export class CreateMovementController {
  constructor(private prisma: PrismaService){}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateMovementBodySchema,
    @Param() param,
    @CurrentUser() user: UserPayload
    ){
      const { type, value, description } = body;
      const { id } = param;
      const userId = user.sub

      const cashier = await this.prisma.cashier.findFirst({
        where: {
          id,
        }
      })

      if (!cashier) {
        throw new ConflictException('Cashier does not exists!')
      }

      if (type === 'ENTRADA') {
        cashier.current_value += value
      } else {
        cashier.current_value -= value
      }

      await this.prisma.cashier.update({
        where: {
          id
        },
        data: {
          current_value: cashier.current_value
        }
      })

      await this.prisma.movement.create({
        data: {
          type,
          value, 
          cashierId: cashier.id,
          description,
          userId,
        }
      })

      return {
        cashier
      }

    }

}