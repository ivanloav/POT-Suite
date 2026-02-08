USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Acciones]    Script Date: 02/11/2024 11:07:01 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Acciones](
	[ACCION] [nvarchar](255) NOT NULL,
	[DESCRIPCION] [nvarchar](255) NULL,
	[FECHA_LANZAMIENTO] [datetime] NULL,
	[PRIORITAIRE] [money] NULL,
	[FRAIS] [money] NULL,
	[Marca] [nvarchar](255) NULL,
	[TIRADA] [int] NULL,
	[DATE_DEPOT] [datetime] NULL,
	[ESTADO] [nvarchar](255) NULL,
	[EXPRESS] [money] NULL,
	[POINT_RELAIS] [money] NULL,
	[CODE_CATALOGUE] [nvarchar](255) NULL,
	[LOT_CATALOGUE] [nvarchar](255) NULL,
	[DESC_CATALOGUE] [nvarchar](255) NULL,
 CONSTRAINT [PK_Acciones_1] PRIMARY KEY CLUSTERED 
(
	[ACCION] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


