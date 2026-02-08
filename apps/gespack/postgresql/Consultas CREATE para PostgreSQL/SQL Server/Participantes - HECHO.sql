USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Participantes]    Script Date: 02/11/2024 11:12:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Participantes](
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
	[TEL] [nvarchar](255) NULL,
	[FECHA_NACIMIENTO] [nvarchar](255) NULL,
	[P1] [nvarchar](255) NULL,
	[Q1] [nvarchar](255) NULL,
	[R1] [nvarchar](255) NULL,
	[S1] [nvarchar](255) NULL,
	[MARCADO] [nvarchar](255) NULL,
	[ACCION] [nvarchar](255) NULL,
	[FECHA_LECTURA] [nvarchar](255) NULL,
	[SECUENCIAL] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_Participantes] PRIMARY KEY CLUSTERED 
(
	[SECUENCIAL] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


