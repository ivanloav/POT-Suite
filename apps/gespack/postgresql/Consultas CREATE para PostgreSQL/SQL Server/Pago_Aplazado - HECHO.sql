USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Pago_Aplazado]    Script Date: 02/11/2024 11:12:29 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Pago_Aplazado](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[PEDIDO] [nvarchar](255) NULL,
	[TIPO_PAGO] [nvarchar](255) NULL,
	[NUM_CHEQUE1] [nvarchar](255) NULL,
	[NUM_CHEQUE2] [nvarchar](255) NULL,
	[NUM_CHEQUE3] [nvarchar](255) NULL,
	[NUM_CHEQUE4] [nvarchar](255) NULL,
	[IMP1] [money] NULL,
	[IMP2] [money] NULL,
	[IMP3] [money] NULL,
	[IMP4] [money] NULL,
	[DATE1] [datetime] NULL,
	[DATE2] [datetime] NULL,
	[DATE3] [datetime] NULL,
	[DATE4] [datetime] NULL,
	[IMPAGO1] [bit] NULL,
	[IMPAGO2] [bit] NULL,
	[IMPAGO3] [bit] NULL,
	[IMPAGO4] [bit] NULL,
	[DATE_IMPAGO1] [datetime] NULL,
	[DATE_IMPAGO2] [datetime] NULL,
	[DATE_IMPAGO3] [datetime] NULL,
	[DATE_IMPAGO4] [datetime] NULL,
	[RECOBRO1] [bit] NULL,
	[RECOBRO2] [bit] NULL,
	[RECOBRO3] [bit] NULL,
	[RECOBRO4] [bit] NULL,
	[DATE_RECOBRO1] [datetime] NULL,
	[DATE_RECOBRO2] [datetime] NULL,
	[DATE_RECOBRO3] [datetime] NULL,
	[DATE_RECOBRO4] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_IMPAGO1]  DEFAULT ((0)) FOR [IMPAGO1]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_IMPAGO2]  DEFAULT ((0)) FOR [IMPAGO2]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_IMPAGO3]  DEFAULT ((0)) FOR [IMPAGO3]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_IMPAGO4]  DEFAULT ((0)) FOR [IMPAGO4]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_RECOBRO1]  DEFAULT ((0)) FOR [RECOBRO1]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_RECOBRO2]  DEFAULT ((0)) FOR [RECOBRO2]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_RECOBRO3]  DEFAULT ((0)) FOR [RECOBRO3]
GO

ALTER TABLE [dbo].[Pago_Aplazado] ADD  CONSTRAINT [DF_Pago_Aplazado_RECOBRO4]  DEFAULT ((0)) FOR [RECOBRO4]
GO


