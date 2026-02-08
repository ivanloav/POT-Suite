USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Regalo]    Script Date: 02/11/2024 11:13:50 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Regalo](
	[ID] [int] NOT NULL,
	[REFERENCIA] [nvarchar](255) NULL,
	[ACCION] [nvarchar](255) NULL,
	[DESCRIPCION] [nvarchar](255) NULL,
	[PESO] [nvarchar](255) NULL,
	[IVA] [float] NULL,
	[UBICACION_PICKING] [nvarchar](255) NULL,
	[UBICACION_ALMACEN] [nvarchar](255) NULL,
	[EMBALAJE] [nvarchar](255) NULL,
	[PRECIO] [nvarchar](255) NULL,
	[UNIDADES_PACK] [nvarchar](255) NULL,
	[STOCK] [nvarchar](255) NULL,
	[COSTE] [nvarchar](255) NULL,
	[INF_ADICIONAL] [nvarchar](255) NULL,
	[TIPO_IVA] [nvarchar](255) NULL,
	[MARCA] [nvarchar](255) NULL,
	[DESDE] [float] NULL,
	[HASTA] [float] NULL,
	[ESTADO] [nvarchar](255) NULL,
 CONSTRAINT [PK_Regalo] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


