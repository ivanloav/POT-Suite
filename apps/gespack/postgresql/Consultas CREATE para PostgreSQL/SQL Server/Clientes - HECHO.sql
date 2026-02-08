USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Clientes]    Script Date: 02/11/2024 11:08:08 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Clientes](
	[NUMERO_DE_CLIENT] [nvarchar](255) NOT NULL,
	[NOMBRE] [nvarchar](255) NULL,
	[DIR1] [nvarchar](255) NULL,
	[DIR2] [nvarchar](255) NULL,
	[DIR3] [nvarchar](255) NULL,
	[DIR4] [nvarchar](255) NULL,
	[DIR5] [nvarchar](255) NULL,
	[SEXO] [nvarchar](255) NULL,
	[NOM] [nvarchar](255) NULL,
	[APE] [nvarchar](255) NULL,
	[TEL] [nvarchar](10) NULL,
	[FECHA_NACIMIENTO] [date] NULL,
	[P1] [nvarchar](255) NULL,
	[Q1] [nvarchar](255) NULL,
	[R1] [nvarchar](255) NULL,
	[S1] [nvarchar](255) NULL,
	[MARCADO] [nvarchar](255) NULL,
	[ENCARTE] [nvarchar](255) NULL,
	[EMAIL] [nvarchar](255) NULL,
	[PORTABLE] [nvarchar](255) NULL,
	[DATE_CLIENT] [nvarchar](255) NULL,
	[PRIVILEGIE] [bit] NOT NULL,
	[DATE_PRIVILEGIE] [date] NULL,
 CONSTRAINT [PK_Clientes_2] PRIMARY KEY CLUSTERED 
(
	[NUMERO_DE_CLIENT] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Clientes] ADD  CONSTRAINT [DF_Clientes_PRIVILEGIE]  DEFAULT ((0)) FOR [PRIVILEGIE]
GO


