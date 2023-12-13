import { Body, ConflictException, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/current-user-decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UserPayload } from "src/auth/jwt.strategy";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const createCashierBodySchema = z.object({
  currentValue: z.number(),
})

const bodyValidationPipe = new ZodValidationPipe(createCashierBodySchema)

type CreateCashierBodySchema = z.infer<typeof createCashierBodySchema>

@Controller('/cashier')
@UseGuards(JwtAuthGuard)
export class CreateCashierController {
  constructor(private prisma: PrismaService){}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateCashierBodySchema, 
    @CurrentUser() user: UserPayload
  ) {    
    const { currentValue } = body
    const userId = user.sub;    

    const existCashierUser = await this.prisma.cashier.findFirst({
      where: {
        userId
      }
    })

    if (existCashierUser) {
      throw new ConflictException('User cashier already exists!')
    }

    const cashier = await this.prisma.cashier.create({
      data: {
        current_value: currentValue,
        userId,
      }
    })

    return {
      cashier
    }
    
  }
}